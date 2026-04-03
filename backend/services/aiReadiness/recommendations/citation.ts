import type { NormalizedChunk, AIRecommendation } from '../../../types';

export function citationRecommendations(chunks: NormalizedChunk[]): AIRecommendation[] {
  return chunks
    .filter((c) => c.type === 'paragraph' && !c.text.match(/https?:\/\//))
    .map((c) => ({
      scope: 'chunk' as const,
      chunkId: c.chunkId,
      category: 'citation' as const,
      severity: 'high' as const,
      issue: 'Unsupported factual claim',
      recommendation: 'Add an authoritative external source to support this statement.',
      expectedImpact: 10,
      artifact: {
        type: 'html' as const,
        content: `<p>${c.text.trim()}</p>\n<p>Source: <a href="https://example.com/authoritative-source" rel="noopener noreferrer" target="_blank">Author Name, "Source Title", Publication, Year</a></p>`,
        filename: 'citation.html',
      },
    }));
}
