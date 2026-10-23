// Display names for engine ids saved on checks.
export const ENGINE_LABELS = {
  gemini: 'Gemini', chatgpt: 'ChatGPT', ai_overviews: 'Google AI Overviews', ai_mode: 'Google AI Mode',
  perplexity: 'Perplexity', claude: 'Claude',
};
export const engineName = id => ENGINE_LABELS[id] || ENGINE_LABELS.gemini;

// "Gemini", "Gemini and ChatGPT", "Gemini, ChatGPT and Perplexity" for the
// engines a set of checks used; "AI" when there are none.
export function enginesOf(checks) {
  const names = [...new Set((checks || []).map(c => engineName(c.engine || 'gemini')))];
  if (names.length <= 1) return names[0] || 'AI';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
