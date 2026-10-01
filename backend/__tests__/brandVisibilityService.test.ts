import { describe, it, expect } from 'vitest';
import { extractMentionSentences, buildSummary, buildNotMentionedHint } from '../services/brandVisibilityService';

// splitSentences / buildAnswerExcerpt now live in services/textExcerpt.ts
// (shared with Citation Monitor and Share of Voice) — see textExcerpt.test.ts.

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

describe('buildNotMentionedHint', () => {
  it('suggests the distinctive word when a multi-word brand has a generic suffix', () => {
    const text = 'Starbucks is one of the most recognizable coffeehouse chains in the world.';
    expect(buildNotMentionedHint('Starbucks coffee', text)).toBe(
      '"Starbucks" appears in the answer — try searching with just that name instead of the fuller version.'
    );
  });

  it('returns null when no individual word of the brand appears at all', () => {
    const text = 'Peet\'s and Dunkin\' are popular alternatives in this space.';
    expect(buildNotMentionedHint('Starbucks coffee', text)).toBeNull();
  });

  it('never triggers for a single-word brand name', () => {
    const text = 'Starbucks is one of the most recognizable coffeehouse chains in the world.';
    expect(buildNotMentionedHint('Starbucks', text)).toBeNull();
  });
});
