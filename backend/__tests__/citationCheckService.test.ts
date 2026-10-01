import { describe, it, expect } from 'vitest';
import { extractDomain, findCitedSourceIndex } from '../services/citationCheckService';
import { buildAnswerExcerpt, ANSWER_EXCERPT_LIMIT } from '../services/textExcerpt';

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

// citationCheckService builds its answerExcerpt with the shared
// buildAnswerExcerpt() (services/textExcerpt.ts, fully covered by
// textExcerpt.test.ts) instead of a blind character slice. These confirm
// this service gets the same sentence/word-boundary behavior.
describe('answerExcerpt (via the shared buildAnswerExcerpt helper)', () => {
  it('leaves a normal answer under the limit completely unchanged', () => {
    const text = 'Gemini cited your page. It is a strong source.';
    expect(buildAnswerExcerpt(text)).toBe(text);
  });

  it('cuts a long answer at a sentence boundary and appends an indicator', () => {
    const sentence = 'Gemini cited several sources for this topic today.';
    const sentences = Array(100).fill(sentence);
    const text = sentences.join(' ');
    expect(text.length).toBeGreaterThan(ANSWER_EXCERPT_LIMIT);

    const result = buildAnswerExcerpt(text);

    expect(result.length).toBeLessThanOrEqual(ANSWER_EXCERPT_LIMIT + 1);
    expect(result.endsWith('…')).toBe(true);
    const withoutEllipsis = result.slice(0, -1);
    const parts = withoutEllipsis.split(/(?<=\.) /);
    expect(parts.length).toBeLessThan(sentences.length);
    for (const part of parts) {
      expect(part).toBe(sentence);
    }
  });

  it('falls back to the nearest word boundary when there is no sentence boundary before the limit', () => {
    const text = Array(500).fill('sourcesource').join(' ');
    expect(text.length).toBeGreaterThan(ANSWER_EXCERPT_LIMIT);

    const result = buildAnswerExcerpt(text);

    expect(result.endsWith('…')).toBe(true);
    const withoutEllipsis = result.slice(0, -1);
    expect(withoutEllipsis.length).toBeLessThanOrEqual(ANSWER_EXCERPT_LIMIT);
    expect(text[withoutEllipsis.length]).toBe(' ');
  });
});
