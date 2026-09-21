// Single source of truth for pillar colors, shared across Dashboard, PillarScores,
// KnowledgeBase, and History. Keep 6-digit hex — Dashboard builds tag backgrounds
// with `${color}26` (alpha-suffixed hex).
export const PILLAR_COLORS = {
  ai_readability: '#6b9bc4',
  digital_authority: '#7cae8f',
  conversion_readiness: '#8f93c7',
  product_discoverability: '#c99b6e',
  rag_readiness: '#b97e97',
};
