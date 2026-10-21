// services/engines/run.ts — one entry point for a citation check on any
// engine other than Gemini: ChatGPT through cloro, the rest through DataForSEO.
import { runEngineCitationCheck as runCloro } from './cloro';
import { runDataforseoCitationCheck, type DfsEngine } from './dataforseo';

const DFS = new Set<string>(['ai_overviews', 'ai_mode', 'perplexity', 'claude']);

export function runEngineCheck(engine: string, topic: string, url: string | null, state: string | null, country = 'US') {
  if (DFS.has(engine)) return runDataforseoCitationCheck(engine as DfsEngine, topic, url, state, country);
  return runCloro(engine, topic, url, state, country);
}
