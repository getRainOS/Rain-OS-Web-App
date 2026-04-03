import type { NormalizedChunk, AIRecommendation } from '../../../types';

export function structureRecommendations(chunks: NormalizedChunk[]): AIRecommendation[] {
  const hasSubheadings = chunks.some((c) => c.type === 'heading' && c.headingLevel && c.headingLevel > 1);

  if (!hasSubheadings) {
    return [
      {
        scope: 'document',
        category: 'structure',
        severity: 'high',
        issue: 'Missing subheadings',
        recommendation: 'Add H2 or H3 subheadings to break up long sections.',
        expectedImpact: 12,
      },
    ];
  }
  return [];
}
