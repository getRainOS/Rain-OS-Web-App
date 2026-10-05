// Single source of truth for pillar colors, shared across Dashboard, PillarScores,
// KnowledgeBase, and History. Keep 6-digit hex — Dashboard builds tag backgrounds
// with `${color}26` (alpha-suffixed hex).
export const PILLAR_COLORS = {
  ai_readability: '#00D9FF',
  digital_authority: '#39FF88',
  conversion_readiness: '#B026FF',
  product_discoverability: '#FF9D00',
  rag_readiness: '#FF2E9A',
  local_presence: '#00FFC2',
};
