// services/textExcerpt.ts
//
// Shared sentence-aware text excerpting, used by Citation Monitor, Brand
// Sentiment, and Share of Voice to build the "what AI answered" excerpt
// shown to the user. A blind character-count slice cuts mid-word or
// mid-sentence; this instead cuts at the nearest sentence boundary at or
// before the limit, falling back to the nearest word boundary only when a
// single sentence has no boundary before the limit.

// Word-form abbreviations that end in a period but aren't sentence
// boundaries. Single-letter-dot chains (e.g. "U.S.", "e.g.") are handled
// separately below rather than listed here.
const SENTENCE_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'ave', 'blvd',
  'inc', 'ltd', 'co', 'corp', 'vs', 'etc', 'approx', 'no', 'fig',
]);

// Splits text into sentences without breaking on common abbreviations
// ("Acme Inc.", "U.S.") that end in a period but aren't real sentence
// boundaries.
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  const boundary = /[.!?]+(?=\s|$)/g;
  let start = 0;
  let match: RegExpExecArray | null;
  while ((match = boundary.exec(text))) {
    const endIdx = match.index + match[0].length;
    const candidate = text.slice(start, endIdx).trim();
    const words = candidate.split(/\s+/);
    const lastWord = (words[words.length - 1] || '').replace(/[.!?]+$/, '').toLowerCase();
    const isAbbreviation =
      SENTENCE_ABBREVIATIONS.has(lastWord) ||
      /^[a-z]$/.test(lastWord) ||
      /^[a-z](\.[a-z])+$/.test(lastWord);
    if (isAbbreviation) continue;
    if (candidate) sentences.push(candidate);
    start = endIdx;
  }
  const rest = text.slice(start).trim();
  if (rest) sentences.push(rest);
  return sentences;
}

export const ANSWER_EXCERPT_LIMIT = 2000;

/**
 * Build a display excerpt that doesn't cut off mid-sentence or mid-word.
 * Accumulates whole sentences (via splitSentences) up to `limit` characters.
 * If even the first sentence alone exceeds the limit (one long run-on with
 * no sentence boundary), falls back to the last whole word before the
 * limit. Appends "…" whenever the excerpt is shorter than the full text,
 * so a truncated excerpt is never visually indistinguishable from an
 * answer that just ended naturally.
 */
export function buildAnswerExcerpt(text: string, limit = ANSWER_EXCERPT_LIMIT): string {
  if (text.length <= limit) return text;

  let excerpt = '';
  for (const sentence of splitSentences(text)) {
    const next = excerpt ? `${excerpt} ${sentence}` : sentence;
    if (next.length > limit) break;
    excerpt = next;
  }

  if (!excerpt) {
    const slice = text.slice(0, limit);
    const lastSpace = slice.lastIndexOf(' ');
    excerpt = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  }

  return `${excerpt}…`;
}
