// The AI engines rain OS checks, as named in marketing copy. This is the
// launch line-up: ChatGPT through cloro; Google AI Overviews, AI Mode,
// Perplexity and Claude through DataForSEO; Gemini direct. The app itself
// reads GET /api/engines for what is switched on.
export const ENGINES = ['ChatGPT', 'Google AI Overviews', 'Google AI Mode', 'Gemini', 'Perplexity', 'Claude'];

export function useLiveEngines(): string[] {
  return ENGINES;
}

// ["ChatGPT", "Gemini", "Perplexity"] → "ChatGPT, Gemini and Perplexity"
export const joinNames = (n: string[]) =>
  n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
