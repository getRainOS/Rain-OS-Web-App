import { describe, it, expect } from 'vitest';
import { splitSentences, buildAnswerExcerpt, ANSWER_EXCERPT_LIMIT } from '../services/textExcerpt';

describe('splitSentences', () => {
  it('splits ordinary sentences on terminal punctuation', () => {
    expect(splitSentences('Acme is great. It ships fast.')).toEqual([
      'Acme is great.',
      'It ships fast.',
    ]);
  });

  it('does not split on "Inc." mid-sentence', () => {
    expect(splitSentences('Acme Inc. makes great products.')).toEqual([
      'Acme Inc. makes great products.',
    ]);
  });

  it('does not split on "U.S." mid-sentence', () => {
    expect(splitSentences('It is a U.S. company with global reach.')).toEqual([
      'It is a U.S. company with global reach.',
    ]);
  });
});

describe('buildAnswerExcerpt', () => {
  it('leaves a normal answer under the limit completely unchanged', () => {
    const text = 'Acme is great. It ships fast.';
    expect(buildAnswerExcerpt(text)).toBe(text);
  });

  it('cuts a long answer at a sentence boundary and appends an indicator', () => {
    const sentence = 'Acme ships great products every single day without fail.';
    const sentences = Array(100).fill(sentence);
    const text = sentences.join(' ');
    expect(text.length).toBeGreaterThan(ANSWER_EXCERPT_LIMIT);

    const result = buildAnswerExcerpt(text);

    expect(result.length).toBeLessThanOrEqual(ANSWER_EXCERPT_LIMIT + 1);
    expect(result.endsWith('…')).toBe(true);

    // Every included chunk must be a complete, unmodified sentence — never
    // a fragment cut mid-sentence or mid-word.
    const withoutEllipsis = result.slice(0, -1);
    const parts = withoutEllipsis.split(/(?<=\.) /);
    expect(parts.length).toBeGreaterThan(0);
    expect(parts.length).toBeLessThan(sentences.length); // confirms truncation actually happened
    for (const part of parts) {
      expect(part).toBe(sentence);
    }
  });

  it('falls back to the nearest word boundary when there is no sentence boundary before the limit', () => {
    const text = Array(500).fill('wordword').join(' '); // no punctuation anywhere
    expect(text.length).toBeGreaterThan(ANSWER_EXCERPT_LIMIT);
    expect(splitSentences(text)).toEqual([text]); // confirms this is the no-boundary case

    const result = buildAnswerExcerpt(text);

    expect(result.endsWith('…')).toBe(true);
    const withoutEllipsis = result.slice(0, -1);
    expect(withoutEllipsis.length).toBeLessThanOrEqual(ANSWER_EXCERPT_LIMIT);
    // Cut landed exactly at a word boundary: the next character in the
    // original text is a space, not a mid-word continuation.
    expect(text.startsWith(withoutEllipsis)).toBe(true);
    expect(text[withoutEllipsis.length]).toBe(' ');
    expect(withoutEllipsis.endsWith(' ')).toBe(false);
  });

  it('respects a custom limit, independent of the default', () => {
    const text = 'Short sentence one. Short sentence two. Short sentence three.';
    const result = buildAnswerExcerpt(text, 24);
    expect(result).toBe('Short sentence one.…');
  });
});
