// services/productImport.ts — fill product fact sheets from what already exists.
//   Shopify store: every product from the public /products.json, paged.
//   Any product page: the Product structured data in the page (JSON-LD), plus
//   Shopify's per-product .json for variants when it's a Shopify page.
// Only facts that are actually there are filled; nothing is guessed here.
import * as cheerio from 'cheerio';
import { cleanFacts, type ProductFacts } from './productFacts';
import { safeFetch } from './safeFetch';

const UA = { 'User-Agent': 'RainOS-Importer/1.0 (+https://getrainos.com)' };
const MAX_PAGES = 4;         // 4 × 250 = up to 1,000 products
const PAGE_SIZE = 250;

export class ImportError extends Error {
  constructor(message: string, public status = 422) { super(message); }
}

async function getJson(url: string, timeoutMs = 15000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await safeFetch(url, { signal: ctrl.signal, headers: { ...UA, Accept: 'application/json' } });
    if (!r.ok) return { __status: r.status };
    return await r.json().catch(() => ({ __status: 'not-json' }));
  } catch (e: any) {
    return { __status: e?.name === 'AbortError' ? 'timeout' : 'unreachable' };
  } finally {
    clearTimeout(t);
  }
}

export function normaliseStoreUrl(input: string): URL {
  let s = String(input || '').trim();
  if (!s) throw new ImportError('Enter your store address, e.g. yourstore.com', 400);
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try { u = new URL(s); } catch { throw new ImportError("That doesn't look like a web address.", 400); }
  if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) throw new ImportError("That doesn't look like a web address.", 400);
  return u;
}

const stripHtml = (html: string) => cheerio.load(`<div>${html || ''}</div>`)('div').text().replace(/\s+/g, ' ').trim();

// One Shopify product from /products.json into a fact sheet.
export function shopifyToFacts(p: any, origin: string): ProductFacts {
  const variants = (Array.isArray(p?.variants) ? p.variants : []);
  const single = variants.length === 1 && /^default title$/i.test(String(variants[0]?.title || ''));
  const first = variants[0] || {};
  const onSale = first.compare_at_price && Number(first.compare_at_price) > Number(first.price);
  return cleanFacts({
    name: p?.title,
    brand: p?.vendor,
    url: p?.handle ? `${origin}/products/${p.handle}` : '',
    image: p?.images?.[0]?.src || p?.image?.src || '',
    sku: single ? first.sku : '',
    gtin: single ? first.barcode : '',
    price: onSale ? first.compare_at_price : first.price,
    salePrice: onSale ? first.price : '',
    variants: single ? [] : variants.map((v: any) => ({
      name: v?.title, price: v?.price, sku: v?.sku || '', gtin: v?.barcode || '',
      inStock: typeof v?.available === 'boolean' ? v.available : null,
    })),
    weight: single && first.grams ? `${(Number(first.grams) / 1000).toFixed(2)} kg` : '',
    sourceText: stripHtml(p?.body_html || ''),
  });
}

export async function importShopifyStore(storeUrl: string): Promise<{ origin: string; products: ProductFacts[] }> {
  const u = normaliseStoreUrl(storeUrl);
  const origin = u.origin;
  const products: ProductFacts[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const j = await getJson(`${origin}/products.json?limit=${PAGE_SIZE}&page=${page}`);
    if (j?.__status) {
      if (page === 1) {
        throw new ImportError(j.__status === 404 || j.__status === 'not-json'
          ? "This doesn't look like a Shopify store, or its product list is turned off. Import product pages one at a time instead."
          : j.__status === 401 || j.__status === 403 || j.__status === 430
          ? "The store blocked the import (it may be password-protected). Import product pages one at a time instead."
          : "We couldn't reach the store. Check the address and try again.");
      }
      break;
    }
    const list = Array.isArray(j?.products) ? j.products : [];
    products.push(...list.map((p: any) => shopifyToFacts(p, origin)).filter((f: ProductFacts) => f.name));
    if (list.length < PAGE_SIZE) break;
  }
  if (!products.length) throw new ImportError('The store has no published products to import.');
  return { origin, products };
}

const asList = (v: any): any[] => (Array.isArray(v) ? v : v == null ? [] : [v]);

// The Product structured data on any product page.
export function pageToFacts(html: string, pageUrl: string): ProductFacts | null {
  const $ = cheerio.load(html);
  const nodes: any[] = [];
  const visit = (n: any) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== 'object') return;
    nodes.push(n);
    if (n['@graph']) visit(n['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, el) => { try { visit(JSON.parse($(el).html() || '')); } catch { /* skip */ } });
  const isType = (n: any, t: string) => asList(n?.['@type']).map(String).includes(t);
  const p = nodes.find(n => isType(n, 'Product') || isType(n, 'ProductGroup'));
  const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  if (!p) return null;
  const offers = asList(p.offers).flatMap((o: any) => (o?.offers ? asList(o.offers) : [o]));
  const o = offers[0] || {};
  const rating = p.aggregateRating || {};
  const variantNodes = asList(p.hasVariant);
  return cleanFacts({
    name: p.name,
    brand: typeof p.brand === 'object' ? p.brand?.name : p.brand,
    url: pageUrl,
    image: asList(p.image).map((i: any) => (typeof i === 'string' ? i : i?.url))[0] || '',
    sku: p.sku, gtin: p.gtin || p.gtin13 || p.gtin12 || p.gtin14 || p.gtin8, mpn: p.mpn,
    price: o.price ?? o.lowPrice, currency: o.priceCurrency,
    variants: variantNodes.length > 1 ? variantNodes.map((v: any) => {
      const vo = asList(v.offers)[0] || {};
      return { name: v.name, price: vo.price, sku: v.sku, gtin: v.gtin || v.gtin13, inStock: vo.availability ? /InStock/i.test(String(vo.availability)) : null };
    }) : offers.length > 1 ? offers.map((x: any, k: number) => ({
      name: x.name || x.sku || `Option ${k + 1}`, price: x.price, sku: x.sku || '', gtin: x.gtin || '',
      inStock: x.availability ? /InStock/i.test(String(x.availability)) : null,
    })) : [],
    materials: typeof p.material === 'string' ? p.material : '',
    rating: rating.ratingValue, reviewCount: rating.reviewCount || rating.ratingCount,
    sourceText: String(p.description || metaDesc || ''),
  });
}

export async function importProductPage(pageUrl: string): Promise<ProductFacts> {
  const u = normaliseStoreUrl(pageUrl);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  let html = '';
  try {
    const r = await safeFetch(u.toString(), { signal: ctrl.signal, headers: UA });
    if (!r.ok) throw new ImportError(`The page returned an error (${r.status}).`);
    html = await r.text();
  } catch (e: any) {
    if (e instanceof ImportError) throw e;
    throw new ImportError(e?.name === 'AbortError' ? 'The page took too long to load.' : "We couldn't reach that page.");
  } finally {
    clearTimeout(t);
  }
  const facts = pageToFacts(html, u.toString());
  // A Shopify product page also has its full variant list at <url>.json.
  if (/\/products\/[^/]+/.test(u.pathname)) {
    const j = await getJson(`${u.origin}${u.pathname.replace(/\/$/, '')}.json`, 8000);
    if (j?.product) {
      const s = shopifyToFacts(j.product, u.origin);
      if (!facts) return s;
      return cleanFacts({ ...s, ...Object.fromEntries(Object.entries(facts).filter(([, v]) => (Array.isArray(v) ? v.length : !!v))), variants: s.variants.length ? s.variants : facts.variants });
    }
  }
  if (!facts) throw new ImportError("We couldn't find product data on that page. You can still fill in the sheet yourself.");
  return facts;
}
