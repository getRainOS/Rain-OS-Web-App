import { describe, it, expect } from 'vitest';
import { cleanFacts, factsCompleteness, factsForPrompt, factsToSchema } from '../services/productFacts';

const sheet = cleanFacts({
  name: 'EcoFlow Mat', brand: 'EcoFlow', gtin: '0123456789012', sku: 'EF-1', price: '$89', currency: 'usd',
  variants: [{ name: '183 cm, Sage', price: '89', sku: 'EF-1-S', inStock: true }, { name: '200 cm, Sand', price: '99', inStock: false }],
  materials: 'Natural tree rubber, cotton top', dimensions: '183 x 61 cm, 4 mm', weight: '2.2 kg',
  bestFor: 'Hot yoga and travel', comparedTo: 'Grippier than Manduka eKO when wet; lighter than Jade Harmony',
  shipping: 'Free over $50, ships in 2 days', returns: '30-day free returns', warranty: '1 year',
  rating: '4.8', reviewCount: '212', reviewQuotes: ['No slipping even in hot yoga.'], evil: '<script>',
});

describe('product fact sheets', () => {
  it('cleans input and drops unknown fields', () => {
    expect(sheet.currency).toBe('USD');
    expect((sheet as any).evil).toBeUndefined();
    expect(sheet.variants).toHaveLength(2);
  });
  it('measures completeness against the rubric', () => {
    expect(factsCompleteness(sheet)).toEqual({ filled: 13, total: 13, missing: [] });
    expect(factsCompleteness(cleanFacts({ name: 'X' })).missing).toContain('Price');
    // A single-option product isn't marked down for having no variants.
    expect(factsCompleteness(cleanFacts({ name: 'Cork Block', price: '24' })).missing).not.toContain('Variants with prices');
  });
  it('gives the rewrite only the facts that were entered, marked as verified', () => {
    const p = factsForPrompt(sheet);
    expect(p).toContain('VERIFIED PRODUCT FACTS');
    expect(p).toContain('Variant "200 cm, Sand": 99 USD, out of stock');
    expect(p).toContain('Customer review: "No slipping even in hot yoga."');
    expect(factsForPrompt(cleanFacts({ name: '' }))).toBe('');
  });
  it('builds Product schema from the sheet', () => {
    const s = JSON.parse(factsToSchema(sheet)!);
    expect(s['@type']).toBe('Product');
    expect(s.brand.name).toBe('EcoFlow');
    expect(s.offers).toHaveLength(2);
    expect(s.offers[1]).toMatchObject({ price: 99, priceCurrency: 'USD', availability: 'https://schema.org/OutOfStock' });
    expect(s.aggregateRating).toEqual({ '@type': 'AggregateRating', ratingValue: 4.8, reviewCount: 212 });
  });
});
