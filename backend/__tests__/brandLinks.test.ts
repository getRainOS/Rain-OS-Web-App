import { describe, it, expect } from 'vitest';
import { normalizeSite, brandKey } from '../services/brandLinkKeys';

describe('normalizeSite', () => {
  it('reduces urls to a bare domain', () => {
    expect(normalizeSite('https://www.Acme.io/pricing')).toBe('acme.io');
    expect(normalizeSite('acme.io')).toBe('acme.io');
  });
  it('rejects things that are not a domain', () => {
    expect(normalizeSite('')).toBeNull();
    expect(normalizeSite('acme')).toBeNull();
  });
});

describe('brandKey', () => {
  it('ignores case, spaces and punctuation', () => {
    expect(brandKey('Acme Corp.')).toBe(brandKey('acme-corp'));
  });
});
