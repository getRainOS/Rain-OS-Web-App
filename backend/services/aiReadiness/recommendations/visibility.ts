import type { AIRecommendation } from '../../../types';

export function visibilityRecommendations(): AIRecommendation[] {
  return [
    {
      scope: 'document',
      category: 'visibility',
      severity: 'low',
      issue: 'Weak semantic anchors',
      recommendation: 'Clarify key concepts and definitions early in the content.',
      expectedImpact: 5,
    },
  ];
}
