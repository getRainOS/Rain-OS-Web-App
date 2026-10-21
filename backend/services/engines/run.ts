// services/engines/run.ts — one entry point for a citation check on any
// engine other than Gemini: ChatGPT through cloro, the rest through DataForSEO.
import { runEngineCitationCheck as runCloro, cloroAnswer } from './cloro';
import { runDataforseoCitationCheck, dataforseoAnswer, type DfsEngine } from './dataforseo';

const DFS = new Set<string>(['ai_overviews', 'ai_mode', 'perplexity', 'claude']);

export function runEngineCheck(engine: string, topic: string, url: string | null, state: string | null, country = 'US') {
  if (DFS.has(engine)) return runDataforseoCitationCheck(engine as DfsEngine, topic, url, state, country);
  return runCloro(engine, topic, url, state, country);
}

// The raw answer from any non-Gemini engine: text, the sources it cited, and
// whether it gave an AI answer at all. Share of Voice and Brand Sentiment
// read these the same way they read Gemini's grounded answer.
// Google's AI Overviews answer a search, not a chat prompt, so they are asked
// the topic itself (searchQuery) rather than the conversational prompt.
export async function askEngine(
  engine: string,
  prompt: string,
  opts: { searchQuery?: string; country?: string; state?: string | null } = {}
): Promise<{ text: string; sources: Array<{ title: string; url: string; domain: string; snippet: string }>; shown: boolean }> {
  if (DFS.has(engine)) {
    const q = engine === 'ai_overviews' && opts.searchQuery ? opts.searchQuery : prompt;
    const a = await dataforseoAnswer(engine as DfsEngine, q, { country: opts.country, state: opts.state });
    return { text: a.text, sources: a.sources, shown: a.present };
  }
  const a = await cloroAnswer(engine, prompt, { country: opts.country, state: opts.state });
  return { text: a.text, sources: a.sources, shown: true };
}
