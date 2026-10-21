// Display names for engine ids saved on checks.
export const ENGINE_LABELS = {
  gemini: 'Gemini', chatgpt: 'ChatGPT', ai_overviews: 'Google AI Overviews', ai_mode: 'Google AI Mode',
  perplexity: 'Perplexity', claude: 'Claude',
};
export const engineName = id => ENGINE_LABELS[id] || ENGINE_LABELS.gemini;
