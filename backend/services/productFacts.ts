// services/productFacts.ts — a product's fact sheet: the facts AI shopping
// answers need, entered once by the owner. The rewrite treats them as
// verified (so it can state them instead of asking for them), and they
// generate the page's Product structured data. No database here.

export interface ProductVariant { name: string; price: string; sku: string; gtin: string; inStock: boolean | null }
export interface ProductFacts {
  name: string; brand: string; url: string; sku: string; gtin: string; mpn: string;
  price: string; currency: string; salePrice: string;
  variants: ProductVariant[];
  materials: string; dimensions: string; weight: string; specs: string;
  bestFor: string; notFor: string; comparedTo: string;
  shipping: string; returns: string; warranty: string;
  rating: string; reviewCount: string; reviewQuotes: string[];
  image: string;
  // The product's own description, kept for AI drafts. Not shown as a fact.
  sourceText: string;
  // Fields an AI drafted that the owner hasn't confirmed. Not treated as
  // verified (not sent to the rewrite, not in the schema) until confirmed.
  drafts: string[];
}

// Facts that usually apply to every product in a store.
export interface StoreDefaults { shipping: string; returns: string; warranty: string; currency: string }

const str = (v: unknown, max = 400) => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '');
const num = (v: string) => { const n = Number(String(v).replace(/[^0-9.]/g, '')); return Number.isFinite(n) && v.trim() ? n : null; };

export function cleanFacts(input: any): ProductFacts {
  const i = input && typeof input === 'object' ? input : {};
  return {
    name: str(i.name, 160), brand: str(i.brand, 120), url: str(i.url, 500), sku: str(i.sku, 80), gtin: str(i.gtin, 32), mpn: str(i.mpn, 80),
    price: str(i.price, 20), currency: str(i.currency, 3).toUpperCase() || 'USD', salePrice: str(i.salePrice, 20),
    variants: (Array.isArray(i.variants) ? i.variants : []).slice(0, 50).map((v: any) => ({
      name: str(v?.name, 120), price: str(v?.price, 20), sku: str(v?.sku, 80), gtin: str(v?.gtin, 32),
      inStock: typeof v?.inStock === 'boolean' ? v.inStock : null,
    })).filter((v: ProductVariant) => v.name),
    materials: str(i.materials), dimensions: str(i.dimensions, 200), weight: str(i.weight, 80), specs: str(i.specs, 1500),
    bestFor: str(i.bestFor), notFor: str(i.notFor), comparedTo: str(i.comparedTo, 800),
    shipping: str(i.shipping), returns: str(i.returns), warranty: str(i.warranty),
    rating: str(i.rating, 4), reviewCount: str(i.reviewCount, 8),
    reviewQuotes: (Array.isArray(i.reviewQuotes) ? i.reviewQuotes : []).map((q: unknown) => str(q, 300)).filter(Boolean).slice(0, 5),
    image: str(i.image, 500),
    sourceText: str(i.sourceText, 4000),
    drafts: (Array.isArray(i.drafts) ? i.drafts : []).filter((d: unknown): d is string => typeof d === 'string' && DRAFTABLE.includes(d)),
  };
}

export const DRAFTABLE = ['bestFor', 'notFor', 'comparedTo', 'materials', 'dimensions', 'weight', 'specs'];

export function cleanDefaults(input: any): StoreDefaults {
  const i = input && typeof input === 'object' ? input : {};
  return { shipping: str(i.shipping), returns: str(i.returns), warranty: str(i.warranty), currency: str(i.currency, 3).toUpperCase() };
}

// What the rewrite and schema may treat as true: the owner's facts, store
// defaults for anything left blank, and no unconfirmed AI drafts.
export function verifiedFacts(f: ProductFacts, d?: StoreDefaults | null): ProductFacts {
  const v: any = { ...f };
  for (const k of f.drafts) v[k] = '';
  if (d) {
    for (const k of ['shipping', 'returns', 'warranty'] as const) if (!v[k] && d[k]) v[k] = d[k];
    if (!f.price && d.currency) v.currency = d.currency;
  }
  return v as ProductFacts;
}

// How complete the sheet is, against what the Product Discoverability rubric asks for.
export function factsCompleteness(f: ProductFacts): { filled: number; total: number; missing: string[] } {
  const checks: Array<[string, boolean]> = [
    ['Brand', !!f.brand], ['SKU or barcode (GTIN)', !!(f.sku || f.gtin || f.mpn)], ['Price', !!f.price],
    // A product without options has no variants to price; its main price covers it.
    ['Variants with prices', f.variants.length ? f.variants.every(v => !!v.price) : !!f.price],
    ['Materials or specs', !!(f.materials || f.specs)], ['Dimensions or weight', !!(f.dimensions || f.weight)],
    ['Best for', !!f.bestFor], ['Compared to alternatives', !!f.comparedTo],
    ['Shipping', !!f.shipping], ['Returns', !!f.returns], ['Warranty', !!f.warranty],
    ['Rating and review count', !!(f.rating && f.reviewCount)], ['Review quotes', f.reviewQuotes.length > 0],
  ];
  return { filled: checks.filter(c => c[1]).length, total: checks.length, missing: checks.filter(c => !c[1]).map(c => c[0]) };
}

// The block the rewrite receives. Only filled fields; nothing is implied.
export function factsForPrompt(f: ProductFacts): string {
  const lines: string[] = [];
  const add = (label: string, v: string) => { if (v) lines.push(`- ${label}: ${v}`); };
  add('Product', f.name); add('Brand', f.brand); add('SKU', f.sku); add('GTIN/barcode', f.gtin); add('MPN', f.mpn);
  if (f.price) add('Price', `${f.price} ${f.currency}${f.salePrice ? ` (sale price ${f.salePrice} ${f.currency})` : ''}`);
  for (const v of f.variants) {
    lines.push(`- Variant "${v.name}": ${[v.price && `${v.price} ${f.currency}`, v.sku && `SKU ${v.sku}`, v.inStock === true ? 'in stock' : v.inStock === false ? 'out of stock' : ''].filter(Boolean).join(', ')}`);
  }
  add('Materials', f.materials); add('Dimensions', f.dimensions); add('Weight', f.weight); add('Other specs', f.specs);
  add('Best for', f.bestFor); add('Not for', f.notFor); add('Compared to alternatives', f.comparedTo);
  add('Shipping', f.shipping); add('Returns', f.returns); add('Warranty', f.warranty);
  if (f.rating) add('Rating', `${f.rating} out of 5${f.reviewCount ? ` from ${f.reviewCount} reviews` : ''}`);
  for (const q of f.reviewQuotes) lines.push(`- Customer review: "${q}"`);
  return lines.length
    ? `VERIFIED PRODUCT FACTS FROM THE OWNER. These are true; use every relevant one, word them naturally, and do not list them under "needsYou":\n${lines.join('\n')}`
    : '';
}

// schema.org Product JSON-LD built only from what the owner entered.
export function factsToSchema(f: ProductFacts): string | null {
  if (!f.name) return null;
  const offer = (price: string, extra: Record<string, unknown> = {}) => (num(price) === null ? null : {
    '@type': 'Offer', price: num(price), priceCurrency: f.currency, ...(f.url ? { url: f.url } : {}), ...extra,
  });
  const offers = f.variants.length
    ? f.variants.map(v => offer(v.price || f.price, {
      name: v.name, ...(v.sku ? { sku: v.sku } : {}), ...(v.gtin ? { gtin: v.gtin } : {}),
      ...(v.inStock !== null ? { availability: `https://schema.org/${v.inStock ? 'InStock' : 'OutOfStock'}` } : {}),
    })).filter(Boolean)
    : [offer(f.salePrice || f.price)].filter(Boolean);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'Product', name: f.name,
    ...(f.brand ? { brand: { '@type': 'Brand', name: f.brand } } : {}),
    ...(f.sku ? { sku: f.sku } : {}), ...(f.gtin ? { gtin: f.gtin } : {}), ...(f.mpn ? { mpn: f.mpn } : {}),
    ...(f.image ? { image: f.image } : {}),
    ...(f.materials ? { material: f.materials } : {}),
    ...(f.weight ? { weight: f.weight } : {}),
    ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
    ...(num(f.rating) !== null && num(f.reviewCount) !== null
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: num(f.rating), reviewCount: num(f.reviewCount) } } : {}),
  };
  return JSON.stringify(schema, null, 2);
}
