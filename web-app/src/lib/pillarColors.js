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
