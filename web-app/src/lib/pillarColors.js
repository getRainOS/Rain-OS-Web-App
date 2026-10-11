// Single source of truth for pillar colors, shared across Dashboard, PillarScores,
// KnowledgeBase, and History. Keep 6-digit hex — Dashboard builds tag backgrounds
// with `${color}26` (alpha-suffixed hex).
//
// One hue family (the logo's blue), varied by shade for legend distinction —
// not a rainbow per pillar. Keeps charts/badges/scores consistent with the
// single-accent-color direction used everywhere else in the product.
export const PILLAR_COLORS = {
  ai_readability: '#2B8FE3',
  digital_authority: '#1C73C4',
  conversion_readiness: '#7DD3FC',
  product_discoverability: '#0284C7',
  rag_readiness: '#93C5FD',
  local_presence: '#3B82F6',
};
