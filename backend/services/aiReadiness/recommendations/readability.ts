import type { NormalizedChunk, AIRecommendation } from '../../../types';

export function readabilityRecommendations(chunks: NormalizedChunk[]): AIRecommendation[] {
  return chunks
    .filter((c) => c.type === 'paragraph' && c.wordCount > 120)
    .map((c) => ({
      scope: 'chunk',
      chunkId: c.chunkId,
      category: 'readability',
      severity: 'medium',
      issue: 'Paragraph is too long for AI parsing',
      recommendation: 'Split this paragraph into shorter paragraphs.',
      expectedImpact: 6,
    }));
}
