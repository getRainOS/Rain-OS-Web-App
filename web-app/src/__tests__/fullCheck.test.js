import { describe, it, expect } from 'vitest';
import { costOf, siteFromUrl, guessBrand } from '../lib/fullCheck.js';

describe('costOf', () => {
  it('Quick plan: scan + one question + brand check', () => {
    expect(costOf('quick', 1)).toBe(3);
  });
  it('Full plan adds Share of Voice at 3 analyses', () => {
    expect(costOf('full', 3)).toBe(1 + 3 + 1 + 3);
  });
});

describe('siteFromUrl', () => {
  it('adds https and drops www', () => {
    expect(siteFromUrl('www.acme.com')).toBe('acme.com');
  });
  it('keeps the host of a full URL', () => {
    expect(siteFromUrl('https://www.acme.com/products?x=1')).toBe('acme.com');
  });
  it('returns an empty string for input it cannot parse', () => {
    expect(siteFromUrl('https://')).toBe('');
  });
});

describe('guessBrand', () => {
  it('capitalises the first label of the domain', () => {
    expect(guessBrand('acme.com')).toBe('Acme');
  });
  it('returns an empty string with no domain', () => {
    expect(guessBrand('')).toBe('');
  });
});
