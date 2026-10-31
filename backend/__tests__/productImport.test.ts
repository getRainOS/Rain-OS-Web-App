import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { shopifyToFacts, importShopifyStore, pageToFacts, importProductPage, normaliseStoreUrl } from '../services/productImport';
import { cleanFacts, verifiedFacts, factsForPrompt, factsCompleteness } from '../services/productFacts';
import { mergeImported } from '../services/productFactService';

// These tests use placeholder hosts and stub fetch themselves. The address
// guard has its own tests (safeFetch.test.ts), so it passes through here.
vi.mock('../services/safeFetch', async () => {
  const actual = await vi.importActual<typeof import('../services/safeFetch')>('../services/safeFetch');
  return {
    ...actual,
    assertPublicHttpUrl: async (u: string) => new URL(u),
    safeFetch: (u: string, init?: RequestInit) => fetch(u, init),
  };
});

vi.mock('../services/db', () => ({ pool: { query: vi.fn() } }));
const store = JSON.parse(readFileSync(join(__dirname, 'fixtures/shopify/products.json'), 'utf8'));
const res = (body: any, status = 200) => ({ ok: status < 400, status, json: async () => body, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });
afterEach(() => vi.unstubAllGlobals());

describe('Shopify import', () => {
  it('maps a multi-variant product: variants, stock, sale price, description', () => {
    const f = shopifyToFacts(store.products[0], 'https://shop.example.com');
    expect(f).toMatchObject({ name: 'EcoFlow Yoga Mat', brand: 'EcoFlow', url: 'https://shop.example.com/products/ecoflow-yoga-mat', price: '89.00', image: 'https://cdn.shopify.com/s/files/mat.jpg' });
    expect(f.variants).toEqual([
      { name: 'Sage / 183 cm', price: '89.00', sku: 'EF-S-183', gtin: '', inStock: true },
      { name: 'Sand / 200 cm', price: '99.00', sku: '', gtin: '', inStock: false },
    ]);
    expect(f.sourceText).toBe('Made from natural tree rubber with an organic cotton top. 183 x 61 cm, 4 mm thick. Grips even in hot yoga.');
  });
  it('maps a single-variant product without a fake "Default Title" variant, with sale price and weight', () => {
    const f = shopifyToFacts(store.products[1], 'https://shop.example.com');
    expect(f.variants).toEqual([]);
    expect(f).toMatchObject({ sku: 'EF-CORK', price: '30.00', salePrice: '24.00', weight: '0.45 kg' });
  });
  it('pages through the store and stops on a short page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(res(store));
    vi.stubGlobal('fetch', fetchMock);
    const r = await importShopifyStore('shop.example.com/collections/all');
    expect(r.origin).toBe('https://shop.example.com');
    expect(r.products).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://shop.example.com/products.json?limit=250&page=1');
  });
  it('explains clearly when it is not a Shopify store or is blocked', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res('<html>', 404)));
    await expect(importShopifyStore('notshopify.com')).rejects.toThrow(/doesn't look like a Shopify store/);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res({}, 401)));
    await expect(importShopifyStore('locked.com')).rejects.toThrow(/blocked the import/);
    expect(() => normaliseStoreUrl('')).toThrow(/Enter your store address/);
  });
});

describe('product page import', () => {
  const page = `<html><head><meta name="description" content="A grippy mat."><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","name":"EcoFlow Yoga Mat","brand":{"@type":"Brand","name":"EcoFlow"},
    "gtin13":"0123456789012","sku":"EF-1","image":["https://x.com/a.jpg"],"aggregateRating":{"ratingValue":4.8,"reviewCount":212},
    "offers":{"@type":"Offer","price":"89.00","priceCurrency":"EUR","availability":"https://schema.org/InStock"}}]}</script></head><body></body></html>`;
  it('reads Product data from any page', () => {
    expect(pageToFacts(page, 'https://wc.example.com/p/mat')).toMatchObject({
      name: 'EcoFlow Yoga Mat', brand: 'EcoFlow', gtin: '0123456789012', sku: 'EF-1', price: '89.00', currency: 'EUR', rating: '4.8', reviewCount: '212', image: 'https://x.com/a.jpg', sourceText: 'A grippy mat.',
    });
  });
  it('on Shopify pages, adds the full variant list from the product .json', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (url.endsWith('.json') ? res({ product: store.products[0] }) : res(page))));
    const f = await importProductPage('https://shop.example.com/products/ecoflow-yoga-mat');
    expect(f.variants).toHaveLength(2);
    expect(f.gtin).toBe('0123456789012');
    expect(f.rating).toBe('4.8');
  });
  it('says so when a page has no product data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res('<html><body>Hi</body></html>')));
    await expect(importProductPage('https://blog.example.com/post')).rejects.toThrow(/couldn't find product data/);
  });
});

describe('verified facts, drafts and re-imports', () => {
  it("re-import refreshes store data but keeps what the owner wrote", () => {
    const mine = cleanFacts({ name: 'Old', url: 'https://s.com/products/a', price: '80', bestFor: 'Hot yoga', shipping: 'Free over $50', reviewQuotes: ['Great'] });
    const fresh = cleanFacts({ name: 'EcoFlow Mat', url: 'https://s.com/products/a', price: '89' });
    expect(mergeImported(mine, fresh)).toMatchObject({ name: 'EcoFlow Mat', price: '89', bestFor: 'Hot yoga', shipping: 'Free over $50', reviewQuotes: ['Great'] });
  });
  it('keeps unconfirmed AI drafts out of the facts the rewrite treats as true, and applies store defaults', () => {
    const f = cleanFacts({ name: 'Mat', price: '89', bestFor: 'Hot yoga', drafts: ['bestFor'] });
    const v = verifiedFacts(f, { shipping: 'Free over $50', returns: '30-day returns', warranty: '', currency: 'USD' });
    expect(v.bestFor).toBe('');
    expect(v.shipping).toBe('Free over $50');
    expect(factsForPrompt(v)).not.toContain('Hot yoga');
    expect(factsCompleteness(v).missing).toContain('Best for');
    const confirmed = verifiedFacts(cleanFacts({ ...f, drafts: [] }), null);
    expect(factsForPrompt(confirmed)).toContain('Best for: Hot yoga');
  });
  it('only allows known fields to be marked as drafts', () => {
    expect(cleanFacts({ name: 'X', drafts: ['bestFor', 'price', 'evil'] }).drafts).toEqual(['bestFor']);
  });
});
