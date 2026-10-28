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
  ai_readability: '#9d9d9d',
  digital_authority: '#808080',
  conversion_readiness: '#696969',
  product_discoverability: '#b6b6b6',
  rag_readiness: '#565656',
  local_presence: '#949494',
};

export const PILLAR_CHART_COLORS = {
  ai_readability: '#cacaca',
  digital_authority: '#aeaeae',
  conversion_readiness: '#969696',
  product_discoverability: '#dddddd',
  rag_readiness: '#808080',
  local_presence: '#acacac',
};
