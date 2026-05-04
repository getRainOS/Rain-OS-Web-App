import { describe, it, expect } from 'vitest';
import { extractDomain, findCitedSourceIndex } from '../services/citationCheckService';

describe('extractDomain', () => {
  it('strips a leading www.', () => {
    expect(extractDomain('https://www.example.com/path')).toBe('example.com');
  });

  it('preserves non-www subdomains', () => {
    expect(extractDomain('https://blog.example.com/post')).toBe('blog.example.com');
  });

  it('strips a trailing slash and path', () => {
    expect(extractDomain('https://example.com/')).toBe('example.com');
    expect(extractDomain('https://example.com/foo/bar?x=1')).toBe('example.com');
  });

  it('handles missing protocol by assuming https', () => {
    expect(extractDomain('example.com/foo')).toBe('example.com');
    expect(extractDomain('www.example.com')).toBe('example.com');
  });

  it('lowercases the hostname', () => {
    expect(extractDomain('https://WWW.Example.COM/X')).toBe('example.com');
  });

  it('falls back gracefully on malformed input', () => {
    // The URL constructor accepts a wide range of inputs; the fallback path
    // (regex strip) must still produce a sane lowercase host without slashes.
    const result = extractDomain('not a url at all');
    expect(result).toBe('not a url at all');

    const stripped = extractDomain('http://EXAMPLE.com/oops');
    expect(stripped).toBe('example.com');
  });

  it('handles an empty string without throwing', () => {
    expect(() => extractDomain('')).not.toThrow();
  });
});

describe('findCitedSourceIndex', () => {
  const sources = [
    { domain: 'wikipedia.org' },
    { domain: 'example.com' },
    { domain: 'blog.example.com' },
    { domain: 'nytimes.com' },
  ];

  it('returns -1 when userDomain is null', () => {
    expect(findCitedSourceIndex(sources, null)).toBe(-1);
  });

  it('returns -1 when no source matches', () => {
    expect(findCitedSourceIndex(sources, 'nowhere.test')).toBe(-1);
  });

  it('finds an exact host match', () => {
    expect(findCitedSourceIndex(sources, 'example.com')).toBe(1);
  });

  it('matches when source domain is a subdomain of the user domain', () => {
    // userDomain = example.com, source = blog.example.com → match
    const onlySub = [{ domain: 'blog.example.com' }];
    expect(findCitedSourceIndex(onlySub, 'example.com')).toBe(0);
  });

  it('matches when user domain is a subdomain of the source domain', () => {
    // userDomain = blog.example.com, source = example.com → match
    const onlyParent = [{ domain: 'example.com' }];
    expect(findCitedSourceIndex(onlyParent, 'blog.example.com')).toBe(0);
  });

  it('returns the first match when multiple sources match', () => {
    expect(findCitedSourceIndex(sources, 'example.com')).toBe(1);
  });

  it('does not produce false positives on similar-but-distinct domains', () => {
    // notexample.com should NOT match example.com — the dot boundary matters.
    const tricky = [{ domain: 'notexample.com' }];
    expect(findCitedSourceIndex(tricky, 'example.com')).toBe(-1);

    const reversed = [{ domain: 'example.com' }];
    expect(findCitedSourceIndex(reversed, 'notexample.com')).toBe(-1);
  });
});
