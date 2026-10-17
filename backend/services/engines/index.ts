// services/engines/index.ts — the AI engines rain OS can run visibility
// checks on. Gemini (with Google Search grounding) is live. ChatGPT and Claude
// are listed so the data model and UI already carry an engine id; each turns
// on once its API key is set and its adapter is written and tested.
export type EngineId = 'gemini' | 'chatgpt' | 'claude';

export interface EngineInfo {
  id: EngineId;
  label: string;        // shown next to results, e.g. "Gemini with Google Search"
  keyEnv: string[];     // any one of these environment variables enables it
  implemented: boolean; // adapter written and tested
}

export const ENGINES: EngineInfo[] = [
  { id: 'gemini', label: 'Gemini with Google Search', keyEnv: ['GEMINI_API_KEY', 'API_KEY'], implemented: true },
  { id: 'chatgpt', label: 'ChatGPT with web search', keyEnv: ['OPENAI_API_KEY'], implemented: false },
  { id: 'claude', label: 'Claude with web search', keyEnv: ['ANTHROPIC_API_KEY'], implemented: false },
];

export function engineLabel(id: string | null | undefined): string {
  return ENGINES.find(e => e.id === id)?.label ?? ENGINES[0].label;
}

// Engines that can run right now: adapter done and a key configured.
export function availableEngines(env: NodeJS.ProcessEnv = process.env): EngineInfo[] {
  return ENGINES.filter(e => e.implemented && e.keyEnv.some(k => !!env[k]));
}
