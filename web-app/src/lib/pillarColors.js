// Single source of truth for pillar colors, shared across Dashboard, PillarScores,
// KnowledgeBase, and History. Keep 6-digit hex — Dashboard builds tag backgrounds
// with `${color}26` (alpha-suffixed hex).
//
// Distinct hues per pillar — a single blue family made different pillars
// indistinguishable at a glance in multi-pillar charts and legends.
// Muted on purpose: these sit on a near-black UI, where saturated neon reads
// as loud and cheap. Use them for small marks (dots, lines, bars), not for
// large numbers or text; numbers stay in the text color.
export const PILLAR_COLORS = {
  ai_readability: '#5B9FD6',
  digital_authority: '#5DB58A',
  conversion_readiness: '#9C88D9',
  product_discoverability: '#D4A25A',
  rag_readiness: '#CF7F9D',
  local_presence: '#4FAEA6',
};

// Fluorescent versions for the dashboard's charts (trend lines and score
// rings), with a soft glow, so they pop against the calm UI. Only for chart
// strokes; text, dots in lists and tags keep the muted PILLAR_COLORS.
export const PILLAR_CHART_COLORS = {
  ai_readability: '#2EC5FF',
  digital_authority: '#39FF88',
  conversion_readiness: '#B76BFF',
  product_discoverability: '#FFC22E',
  rag_readiness: '#FF3DA8',
  local_presence: '#1FFFE0',
};
