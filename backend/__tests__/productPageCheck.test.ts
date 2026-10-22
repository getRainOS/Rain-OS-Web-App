import { describe, it, expect } from 'vitest';
import { checkProductPage } from '../services/productPageCheck';

const byId = (r: ReturnType<typeof checkProductPage>, id: string) => r.items.find(i => i.id === id);

const good = `<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"EcoFlow Mat",
"brand":{"@type":"Brand","name":"EcoFlow"},"gtin13":"0123456789012","sku":"EF-1","image":"https://x.com/m.jpg",
"aggregateRating":{"@type":"AggregateRating","ratingValue":4.8,"reviewCount":212},
"offers":[{"@type":"Offer","price":"89.00","priceCurrency":"USD","availability":"https://schema.org/InStock",
 "shippingDetails":{"@type":"OfferShippingDetails"},"hasMerchantReturnPolicy":{"@type":"MerchantReturnPolicy"}},
 {"@type":"Offer","price":"99.00","priceCurrency":"USD","availability":"https://schema.org/InStock"}]}</script></head>
<body><h1>EcoFlow Mat</h1><p>$89.00</p><table><tr><td>Length</td><td>183 cm</td></tr></table>
<p>Free shipping over $50. 30-day free returns.</p><h2>FAQ</h2></body></html>`;

describe('checkProductPage', () => {
  it('passes a complete product page', () => {
    const r = checkProductPage(good);
    expect(r.items.filter(i => !i.pass).map(i => i.id)).toEqual([]);
    expect(r.productName).toBe('EcoFlow Mat');
  });
  it('flags a page with no schema, no price and vague copy', () => {
    const r = checkProductPage('<html><body><h1>The EcoFlow Mat</h1><p>Great grip. Free shipping on orders over a certain amount.</p></body></html>');
    for (const id of ['schema_product', 'schema_price', 'schema_identifier', 'schema_rating', 'price_match', 'specs', 'returns_text', 'faq']) {
      expect(byId(r, id)?.pass).toBe(false);
      expect(byId(r, id)?.fix).toBeTruthy();
    }
    expect(byId(r, 'shipping_text')?.pass).toBe(true);
  });
  it('catches a visible price that differs from the schema', () => {
    expect(byId(checkProductPage(good.replace('<p>$89.00</p>', '<p>$79.00</p>')), 'price_match')?.pass).toBe(false);
  });
  it("reads Shopify variants and counts what's missing", () => {
    const r = checkProductPage(good, [{ price: '89.00', sku: 'EF-1', barcode: '012' }, { price: '99.00', sku: '', barcode: null }]);
    expect(r.variants).toEqual({ total: 2, missingPrice: 0, missingSku: 1, missingBarcode: 1 });
    expect(byId(r, 'variant_data')?.pass).toBe(false);
  });
});
