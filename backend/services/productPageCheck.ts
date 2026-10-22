// services/productPageCheck.ts — what AI shopping answers can read off a
// product page, measured exactly (no AI): the Product schema's fields, whether
// the visible price matches the schema, specs, shipping, returns and FAQ, and
// for Shopify stores each variant's price, SKU and barcode from the store's
// public product data. Runs on the HTML the URL Scanner already fetched.
import * as cheerio from 'cheerio';

export interface ProductCheckItem { id: string; label: string; pass: boolean; detail: string; fix?: string }
export interface ProductPageCheck {
  productName: string | null;
  passed: number;
  total: number;
  items: ProductCheckItem[];
  variants: { total: number; missingPrice: number; missingSku: number; missingBarcode: number } | null;
}

const asList = (v: any): any[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const types = (n: any): string[] => asList(n?.['@type']).map(String);

function schemaNodes($: cheerio.CheerioAPI): any[] {
  const out: any[] = [];
  const visit = (n: any) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== 'object') return;
    out.push(n);
    if (n['@graph']) visit(n['@graph']);
    if (n.hasVariant) visit(n.hasVariant);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try { visit(JSON.parse($(el).html() || '')); } catch { /* malformed JSON-LD — skip */ }
  });
  return out;
}

// "29.99" from "$29.99", "29,99 €", "USD 29.99".
const priceNumbers = (text: string): number[] =>
  Array.from(text.matchAll(/(?:[$£€]\s?|\b(?:USD|GBP|EUR|CAD|AUD)\s?)(\d{1,6}(?:[.,]\d{2})?)|(\d{1,6}(?:[.,]\d{2}))\s?(?:€|USD|EUR)/g))
    .map(m => Number(String(m[1] || m[2]).replace(',', '.')))
    .filter(n => Number.isFinite(n));

export interface ShopifyVariant { price?: string | null; sku?: string | null; barcode?: string | null }

export function checkProductPage(html: string, shopifyVariants: ShopifyVariant[] | null = null): ProductPageCheck {
  const $ = cheerio.load(html);
  const nodes = schemaNodes($);
  const product = nodes.find(n => types(n).some(t => t === 'Product' || t === 'ProductGroup')) || null;
  const variantNodes = nodes.filter(n => types(n).includes('Product') && n !== product);
  const offers = product ? asList(product.offers).flatMap((o: any) => (o?.offers ? asList(o.offers) : [o])) : [];
  const offer = offers[0] || null;
  const schemaPrice = offer ? Number(offer.price ?? offer.lowPrice) : NaN;

  $('script, style, noscript').remove();
  const body = $('body').text().replace(/\s+/g, ' ');
  const lower = body.toLowerCase();

  const items: ProductCheckItem[] = [];
  const add = (id: string, label: string, pass: boolean, detail: string, fix: string) =>
    items.push({ id, label, pass, detail, ...(pass ? {} : { fix }) });

  add('schema_product', 'Product schema on the page', !!product,
    product ? `Found: ${String(product.name || 'unnamed product')}.` : 'No Product schema found.',
    'Add Product structured data (JSON-LD). On Shopify, most themes include it; on other platforms an SEO plugin or a code snippet does.');
  add('schema_price', 'Price with currency in the schema', !!offer && Number.isFinite(schemaPrice) && !!offer.priceCurrency,
    offer ? `Price ${offer.price ?? offer.lowPrice ?? 'missing'} ${offer.priceCurrency || '(no currency)'}.` : 'No offer (price) in the schema.',
    'Add "offers" with "price" and "priceCurrency" (e.g. "USD") to the Product schema.');
  add('schema_availability', 'Stock status in the schema', !!offer?.availability,
    offer?.availability ? `Availability: ${String(offer.availability).replace('https://schema.org/', '')}.` : 'No availability in the offer.',
    'Add "availability": "https://schema.org/InStock" (or OutOfStock / PreOrder) to the offer.');
  add('schema_brand', 'Brand in the schema', !!product?.brand,
    product?.brand ? `Brand: ${typeof product.brand === 'object' ? product.brand.name : product.brand}.` : 'No brand in the schema.',
    'Add "brand": { "@type": "Brand", "name": "Your brand" }.');
  const ident = product && (product.gtin || product.gtin8 || product.gtin12 || product.gtin13 || product.gtin14 || product.mpn || product.sku);
  add('schema_identifier', 'Product identifier (GTIN, MPN or SKU)', !!ident,
    ident ? `Identifier: ${ident}.` : 'No GTIN, MPN or SKU in the schema.',
    'Add the barcode as "gtin" (UPC/EAN), or "mpn", and "sku". Shopping engines match products by these.');
  add('schema_image', 'Product image in the schema', !!product?.image,
    product?.image ? 'Image set.' : 'No image in the schema.', 'Add "image" with at least one product photo URL.');
  const rating = product?.aggregateRating;
  add('schema_rating', 'Rating and review count in the schema', !!rating?.ratingValue && !!(rating?.reviewCount || rating?.ratingCount),
    rating ? `${rating.ratingValue} from ${rating.reviewCount || rating.ratingCount || '?'} reviews.` : 'No aggregateRating.',
    'Add "aggregateRating" with "ratingValue" and "reviewCount" from your real reviews (a reviews app usually does this).');
  add('schema_shipping', 'Shipping details in the schema', offers.some((o: any) => o?.shippingDetails),
    offers.some((o: any) => o?.shippingDetails) ? 'Shipping details set.' : 'No shippingDetails in the offer.',
    'Add "shippingDetails" (cost and delivery time) to the offer, or set shipping in Google Merchant Center.');
  add('schema_returns', 'Return policy in the schema', offers.some((o: any) => o?.hasMerchantReturnPolicy) || nodes.some(n => n.hasMerchantReturnPolicy),
    'Checked the offer and organization for hasMerchantReturnPolicy.',
    'Add "hasMerchantReturnPolicy" (return window and method) to the offer or your Organization schema.');
  const variantCount = variantNodes.length || (product?.hasVariant ? asList(product.hasVariant).length : 0) || (offers.length > 1 ? offers.length : 0);
  if (variantCount > 0 || shopifyVariants) {
    add('schema_variants', 'Variants described in the schema', variantCount > 1 || (shopifyVariants?.length ?? 0) <= 1,
      variantCount > 1 ? `${variantCount} variants in the schema.` : `${shopifyVariants?.length ?? 0} variants in the store, but the schema describes ${variantCount || 1}.`,
      'Describe each size/color as its own offer or variant (ProductGroup with hasVariant), each with its own price and stock.');
  }

  const visible = priceNumbers(body);
  add('price_match', 'Visible price matches the schema', Number.isFinite(schemaPrice) && visible.some(v => Math.abs(v - schemaPrice) < 0.01),
    !Number.isFinite(schemaPrice) ? 'No schema price to compare.' : visible.length ? `Page shows ${visible.slice(0, 3).join(', ')}; schema says ${schemaPrice}.` : 'No price visible on the page.',
    'Show the same price on the page as in the schema. A mismatch can get the product dropped from shopping results.');
  const specs = $('table').length > 0 || $('dl').length > 0 || /\b\d+(\.\d+)?\s?(mm|cm|in|inch|inches|kg|g|lb|lbs|oz|ml|l)\b/i.test(body);
  add('specs', 'Specs stated as facts', specs,
    specs ? 'Found a spec table or measurements with units.' : 'No spec table, and no measurements with units.',
    'Add a short spec list: dimensions, weight, materials, compatibility, with numbers and units.');
  add('shipping_text', 'Shipping stated on the page', /shipping|delivery|ships in/.test(lower),
    /shipping|delivery|ships in/.test(lower) ? 'The page mentions shipping or delivery.' : 'No shipping or delivery information on the page.',
    'State shipping cost, delivery time and any free-shipping threshold on the page.');
  add('returns_text', 'Returns stated on the page', /return|refund|exchange/.test(lower),
    /return|refund|exchange/.test(lower) ? 'The page mentions returns or refunds.' : 'No returns or refund information on the page.',
    'State the return window and conditions on the page (e.g. "30-day free returns").');
  const hasFaq = nodes.some(n => types(n).includes('FAQPage')) || /\b(faq|frequently asked)\b/.test(lower);
  add('faq', 'Buyer FAQ', hasFaq, hasFaq ? 'Found an FAQ.' : 'No FAQ on the page.',
    'Answer the questions shoppers ask AI: sizing, care, durability, warranty, who it is for.');

  let variants: ProductPageCheck['variants'] = null;
  if (shopifyVariants && shopifyVariants.length) {
    variants = {
      total: shopifyVariants.length,
      missingPrice: shopifyVariants.filter(v => !v.price || Number(v.price) <= 0).length,
      missingSku: shopifyVariants.filter(v => !v.sku).length,
      missingBarcode: shopifyVariants.filter(v => !v.barcode).length,
    };
    add('variant_data', 'Every variant has a price, SKU and barcode', variants.missingPrice + variants.missingSku + variants.missingBarcode === 0,
      `${variants.total} variants: ${variants.missingPrice} without a price, ${variants.missingSku} without a SKU, ${variants.missingBarcode} without a barcode.`,
      'In Shopify, open the product and fill in SKU and Barcode (UPC/EAN/ISBN) for every variant.');
  }

  return { productName: product?.name ? String(product.name) : null, passed: items.filter(i => i.pass).length, total: items.length, items, variants };
}

// Shopify serves any product page's data at the same URL + ".json". Best
// effort: a store that blocks it just means the variant check is skipped.
export async function fetchShopifyVariants(pageUrl: string, timeoutMs = 5000): Promise<ShopifyVariant[] | null> {
  const u = new URL(pageUrl);
  if (!/\/products\/[^/]+/.test(u.pathname)) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${u.origin}${u.pathname.replace(/\/$/, '')}.json`, { signal: ctrl.signal, headers: { 'User-Agent': 'RainOS-Scanner/1.0 (+https://getrainos.com)' } });
    if (!r.ok) return null;
    const j: any = await r.json();
    const vs = j?.product?.variants;
    return Array.isArray(vs) ? vs.map((v: any) => ({ price: v?.price ?? null, sku: v?.sku ?? null, barcode: v?.barcode ?? null })) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
