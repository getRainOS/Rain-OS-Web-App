// Single source of truth for pillar colors, shared across Dashboard, PillarScores,
// KnowledgeBase, ContentAnalyzer and History.
//
// PILLAR_COLORS: for small marks (dots, tags, bars) on the dark UI.
// PILLAR_CHART_COLORS: the trend lines, one colour per pillar, in the multi-colour
// set used on the Profound reference chart (white, blue, orange, teal, red, violet).
// Each colour is distinct on the near-black background. Keep 6-digit hex:
// Dashboard builds tag backgrounds with `${color}26` (alpha-suffixed hex).
export const PILLAR_COLORS = {
  ai_readability: '#9d9d9d',
  digital_authority: '#808080',
  conversion_readiness: '#696969',
  product_discoverability: '#b6b6b6',
  rag_readiness: '#565656',
  local_presence: '#949494',
};

export const PILLAR_CHART_COLORS = {
  ai_readability: '#FFFFFF',
  digital_authority: '#3B82F6',
  conversion_readiness: '#F97316',
  product_discoverability: '#14B8A6',
  rag_readiness: '#EF4444',
  local_presence: '#A78BFA',
};
