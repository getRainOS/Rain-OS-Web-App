import type { AIRecommendation } from '../../../types';

export function freshnessRecommendations(lastModified?: string): AIRecommendation[] {
  if (!lastModified) return [];
  return [
    {
      scope: 'document',
      category: 'freshness',
      severity: 'medium',
      issue: 'Content may be outdated',
      recommendation: 'Review and update time-sensitive references.',
      expectedImpact: 8,
    },
  ];
}
