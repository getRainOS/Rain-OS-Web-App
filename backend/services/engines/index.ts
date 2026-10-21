// services/engines/index.ts — the AI engines rain OS can run visibility
// checks on. Gemini (with Google Search grounding) runs direct; ChatGPT
// through cloro (engines/cloro.ts); Google AI Overviews, AI Mode, Perplexity
// and Claude through DataForSEO (engines/dataforseo.ts). An engine is on when
// its keys are set; an unverified adapter also needs its verify flag, set only
// after a real call has been checked.
export type EngineId = 'gemini' | 'chatgpt' | 'ai_overviews' | 'ai_mode' | 'perplexity' | 'claude';

export interface EngineInfo {
  id: EngineId;
  label: string;        // shown next to results, e.g. "Gemini with Google Search"
  short: string;        // used in marketing copy, e.g. "Gemini"
  keyEnv: string[];     // all of these environment variables must be set
  altKeyEnv?: string[]; // or any one of these
  verifyEnv?: string;   // must be "true" before an unverified adapter runs
  implemented: boolean; // adapter written
  location: 'state' | 'none'; // whether the engine itself can ask from a place
}

const DFS_KEYS = ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'];

export const ENGINES: EngineInfo[] = [
  { id: 'gemini', label: 'Gemini with Google Search', short: 'Gemini', keyEnv: [], altKeyEnv: ['GEMINI_API_KEY', 'API_KEY'], implemented: true, location: 'none' },
  { id: 'chatgpt', label: 'ChatGPT', short: 'ChatGPT', keyEnv: ['CLORO_API_KEY'], implemented: true, location: 'state' },
  { id: 'ai_overviews', label: 'Google AI Overviews', short: 'Google AI Overviews', keyEnv: DFS_KEYS, verifyEnv: 'DATAFORSEO_VERIFIED', implemented: true, location: 'state' },
  { id: 'ai_mode', label: 'Google AI Mode', short: 'Google AI Mode', keyEnv: DFS_KEYS, verifyEnv: 'DATAFORSEO_VERIFIED', implemented: true, location: 'state' },
  { id: 'perplexity', label: 'Perplexity', short: 'Perplexity', keyEnv: DFS_KEYS, verifyEnv: 'DATAFORSEO_VERIFIED', implemented: true, location: 'none' },
  { id: 'claude', label: 'Claude', short: 'Claude', keyEnv: DFS_KEYS, verifyEnv: 'DATAFORSEO_VERIFIED', implemented: true, location: 'none' },
];

export function engineLabel(id: string | null | undefined): string {
  return ENGINES.find(e => e.id === id)?.label ?? ENGINES[0].label;
}

// Engines that can run right now: adapter done and a key configured.
export function availableEngines(env: NodeJS.ProcessEnv = process.env): EngineInfo[] {
  return ENGINES.filter(e =>
    e.implemented
    && e.keyEnv.every(k => !!env[k])
    && (!e.altKeyEnv || e.altKeyEnv.some(k => !!env[k]))
    && (!e.verifyEnv || env[e.verifyEnv] === 'true'));
}
