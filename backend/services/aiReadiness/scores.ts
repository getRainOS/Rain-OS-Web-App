import type { AIReadinessScores, NormalizedChunk } from '../../types';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeAiReadinessScores(input: {
  chunks: NormalizedChunk[];
  lastModified?: string;
  outboundLinks?: string[];
}): AIReadinessScores {
  const { chunks } = input;
  const paragraphs = chunks.filter((c) => c.type === 'paragraph');
  const headings = chunks.filter((c) => c.type === 'heading');
  const lists = chunks.filter((c) => c.type === 'list');

  const avgParaWords =
    paragraphs.length ? paragraphs.reduce((a, c) => a + c.wordCount, 0) / paragraphs.length : 0;

  // Readability: penalize long paragraphs, reward some structure
  let readability = 75;
  if (avgParaWords > 120) readability -= 12;
  if (avgParaWords > 160) readability -= 10;
  if (lists.length > 0) readability += 4;
  if (headings.length > 1) readability += 4;

  // Structure: reward headings and chunk variety
  let structure = 70;
  if (headings.length === 0) structure -= 18;
  if (headings.some((h) => (h.headingLevel || 0) >= 2)) structure += 10;
  if (lists.length > 0) structure += 6;

  // Citation: reward outbound links
  let citation = 60;
  const linkCount = (input.outboundLinks || []).length;
  if (linkCount >= 1) citation += 10;
  if (linkCount >= 3) citation += 10;

  // Freshness: if lastModified exists, slight boost; otherwise neutral
  let freshness = 65;
  if (input.lastModified) freshness += 5;

  // Visibility: reward early headings and definition-like patterns
  let visibility = 68;
  const earlyText = paragraphs.slice(0, 2).map((p) => p.text).join(' ').toLowerCase();
  if (earlyText.includes(' is ') || earlyText.includes(' means ') || earlyText.includes(' refers to '))
    visibility += 7;
  if (headings.length > 0) visibility += 5;

  return {
    readability: clamp(readability),
    structure: clamp(structure),
    freshness: clamp(freshness),
    citation: clamp(citation),
    visibility: clamp(visibility),
  };
}
