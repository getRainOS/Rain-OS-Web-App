// Single source of truth for pillar colors, shared across Dashboard, PillarScores,
// KnowledgeBase, ContentAnalyzer and History.
//
// One blue family, six steps from light to deep, so the app has one accent
// instead of a rainbow. Pillars are told apart by their position in the list
// and their label, not by hue. Keep 6-digit hex: Dashboard builds tag backgrounds
// with `${color}26` (alpha-suffixed hex).
//
// PILLAR_COLORS: for small marks (dots, tags, bars) on the dark UI.
// PILLAR_CHART_COLORS: brighter steps for thin trend lines and score rings,
// so they read crisply on the near-black background.
export const PILLAR_COLORS = {
  ai_readability: '#6FA8D9',
  digital_authority: '#4F8CC4',
  conversion_readiness: '#3A74AD',
  product_discoverability: '#94BEE3',
  rag_readiness: '#2D5F92',
  local_presence: '#7F98B3',
};

export const PILLAR_CHART_COLORS = {
  ai_readability: '#A6D4F7',
  digital_authority: '#7CBBF0',
  conversion_readiness: '#58A6E8',
  product_discoverability: '#C6E3FA',
  rag_readiness: '#3F8FD9',
  local_presence: '#8FB3D6',
};
