import { readabilityRecommendations } from './readability';
import { structureRecommendations } from './structure';
import { citationRecommendations } from './citation';
import { freshnessRecommendations } from './freshness';
import { visibilityRecommendations } from './visibility';
import type { NormalizedChunk } from '../../../types';

export function generateAllRecommendations(context: { chunks: NormalizedChunk[]; lastModified?: string }) {
  return [
    ...readabilityRecommendations(context.chunks),
    ...structureRecommendations(context.chunks),
    ...citationRecommendations(context.chunks),
    ...freshnessRecommendations(context.lastModified),
    ...visibilityRecommendations(),
  ];
}
