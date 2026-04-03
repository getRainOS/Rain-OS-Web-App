import type { NormalizedChunk, AIRecommendation } from '../../../types';

export function citationRecommendations(chunks: NormalizedChunk[]): AIRecommendation[] {
  return chunks
    .filter((c) => c.type === 'paragraph' && !c.text.match(/https?:\/\//))
    .map((c) => ({
      scope: 'chunk',
      chunkId: c.chunkId,
      category: 'citation',
      severity: 'high',
      issue: 'Unsupported factual claim',
      recommendation: 'Add an authoritative external source to support this statement.',
      expectedImpact: 10,
    }));
}
