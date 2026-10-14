import { describe, it, expect } from 'vitest';
import { isSharedPlatform, matchableDomain } from '../services/sharedPlatforms';
import { findCitedSourceIndex, isSameDomain } from '../services/citationCheckService';
import { computeDomainShare } from '../services/shareOfVoiceService';

describe('isSharedPlatform', () => {
  it('flags platforms where a business lives under a path', () => {
    for (const d of ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'yelp.com', 'github.com', 'linkedin.com', 'sites.google.com']) {
      expect(isSharedPlatform(d)).toBe(true);
    }
  });

  it('does not flag a business\'s own domain, including per-business subdomains', () => {
    for (const d of ['acme.com', 'acme.myshopify.com', 'acme.github.io', 'notfacebook.com', 'yelp.com.au.example.org']) {
      expect(isSharedPlatform(d)).toBe(false);
    }
  });

  it('handles empty input', () => {
    expect(isSharedPlatform(null)).toBe(false);
    expect(isSharedPlatform('')).toBe(false);
  });
});

describe('matchableDomain', () => {
  it('returns the domain for a real site and null otherwise', () => {
    expect(matchableDomain('acme.com')).toBe('acme.com');
    expect(matchableDomain('facebook.com')).toBeNull();
    expect(matchableDomain(null)).toBeNull();
  });
});

describe('matching never claims a shared-platform page was cited', () => {
  const sources = [{ domain: 'yelp.com' }, { domain: 'acme.com' }];

  it('findCitedSourceIndex returns -1 for a shared platform even when that domain is a source', () => {
    expect(findCitedSourceIndex(sources, 'yelp.com')).toBe(-1);
    expect(findCitedSourceIndex(sources, 'acme.com')).toBe(1);
  });

  it('the plain domain comparison is unchanged', () => {
    expect(isSameDomain('yelp.com', 'yelp.com')).toBe(true);
  });

  it('computeDomainShare is unaffected for real domains', () => {
    const srcs = [{ title: 'a', url: 'u', domain: 'acme.com' }, { title: 'b', url: 'u', domain: 'g2.com' }];
    expect(computeDomainShare(srcs, 'acme.com').domainSharePercent).toBe(50);
  });
});
