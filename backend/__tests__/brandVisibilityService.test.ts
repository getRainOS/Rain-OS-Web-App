import { describe, it, expect } from 'vitest';
import { extractMentionSentences, splitSentences, buildSummary, buildAnswerExcerpt, ANSWER_EXCERPT_LIMIT } from '../services/brandVisibilityService';

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

describe('extractMentionSentences', () => {
  it('returns only sentences that contain the brand, via the shared matcher', () => {
    const text = 'Acme is a great tool. Widgetco is also popular. Acme ships fast.';
    expect(extractMentionSentences('Acme', text)).toEqual([
      'Acme is a great tool.',
      'Acme ships fast.',
    ]);
  });

  it('returns an empty list when the brand is not mentioned', () => {
    const text = 'Widgetco is a great tool. It ships fast.';
    expect(extractMentionSentences('Acme', text)).toEqual([]);
  });

  it('returns at most 3 sentences even when the brand is mentioned more often', () => {
    const text = 'Acme is great. Acme is fast. Acme is cheap. Acme is popular.';
    const result = extractMentionSentences('Acme', text);
    expect(result.length).toBe(3);
    expect(result).toEqual(['Acme is great.', 'Acme is fast.', 'Acme is cheap.']);
  });

  it('does not lose a mention inside an abbreviation-heavy sentence', () => {
    const text = 'Acme Inc. is a U.S. company that ships fast.';
    expect(extractMentionSentences('Acme', text)).toEqual([
      'Acme Inc. is a U.S. company that ships fast.',
    ]);
  });
});

describe('buildSummary', () => {
  it('describes a mentioned, cited brand', () => {
    expect(buildSummary('Acme', true, true, [])).toBe(
      'Gemini mentioned Acme in its answer, and your site is among the sources it cited.'
    );
  });

  it('describes a mentioned, not-cited brand', () => {
    expect(buildSummary('Acme', true, false, [])).toBe(
      'Gemini mentioned Acme in its answer for this topic.'
    );
  });

  it('describes a not-mentioned but cited brand', () => {
    expect(buildSummary('Acme', false, true, [])).toBe(
      "Gemini didn't mention Acme by name, but your site is among the sources it cited."
    );
  });

  it('describes a not-mentioned, not-cited brand with competitor domains', () => {
    expect(buildSummary('Acme', false, false, ['widgetco.com', 'gizmo.io'])).toBe(
      'Gemini did not mention Acme — it favored widgetco.com, gizmo.io instead when answering this topic.'
    );
  });

  it('describes a not-mentioned, not-cited brand with no competitor domains', () => {
    expect(buildSummary('Acme', false, false, [])).toBe(
      'Gemini did not mention Acme when answering this topic.'
    );
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
});
