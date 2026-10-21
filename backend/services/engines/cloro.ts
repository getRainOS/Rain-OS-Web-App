// services/engines/cloro.ts — ChatGPT (and other engines) through cloro, which
// returns the answer a person would see in the consumer app plus the sources
// it cited. API shape confirmed against the live service:
//   POST https://api.cloro.dev/v1/monitor/<engine>  { prompt, country, state? }
//   → { success, result: { text, sources: [{ position, label, url }], entities } }
//   credits in the X-Credits-Charged response header.
import { extractDomain, findCitedSourceIndex, buildSummary, type CitationCheckResult, type CitationSource } from '../citationCheckService';
import { matchableDomain } from '../sharedPlatforms';
import { buildAnswerExcerpt } from '../textExcerpt';
import { US_STATES } from './location';

const BASE = 'https://api.cloro.dev/v1/monitor';
const ENGINE_NAMES: Record<string, string> = { chatgpt: 'ChatGPT', gemini: 'Gemini', perplexity: 'Perplexity', copilot: 'Copilot' };

export { US_STATES };

export function cloroAvailable(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env.CLORO_API_KEY;
}

import { EngineError } from './engineError';
export { EngineError };

export interface CloroAnswer { text: string; sources: CitationSource[]; entities: string[]; credits: number | null }

// Turns cloro's result into our source list: one entry per URL, in order.
export function parseCloroResult(result: any): Omit<CloroAnswer, 'credits'> {
  const seen = new Set<string>();
  const sources: CitationSource[] = [];
  for (const s of Array.isArray(result?.sources) ? result.sources : []) {
    const url = typeof s?.url === 'string' ? s.url : '';
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const domain = extractDomain(url);
    sources.push({ title: typeof s.label === 'string' && s.label ? s.label : domain, url, domain, snippet: '' });
  }
  const entities = (Array.isArray(result?.entities) ? result.entities : [])
    .map((e: any) => (typeof e?.name === 'string' ? e.name.trim() : ''))
    .filter(Boolean);
  return { text: typeof result?.text === 'string' ? result.text : '', sources, entities };
}

export async function cloroAnswer(engine: string, prompt: string, opts: { country?: string; state?: string | null; timeoutMs?: number } = {}): Promise<CloroAnswer> {
  const key = process.env.CLORO_API_KEY;
  if (!key) throw new EngineError('ChatGPT checks are not set up yet.', 503, 'engine_unavailable');
  const country = opts.country || 'US';
  const state = country === 'US' && opts.state && US_STATES.has(opts.state) ? opts.state : undefined;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120000);
  try {
    const res = await fetch(`${BASE}/${engine}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, country, ...(state ? { state } : {}) }),
      signal: ctrl.signal,
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      const code = json?.error?.code;
      const unavailable = code === 'MODEL_UNAVAILABLE' || res.status >= 500;
      throw new EngineError(
        unavailable ? `${ENGINE_NAMES[engine] || engine} is temporarily unavailable. Try again later.` : (json?.error?.message || `Request failed (${res.status})`),
        unavailable ? 503 : 502,
        code
      );
    }
    const credits = Number(res.headers.get('x-credits-charged'));
    return { ...parseCloroResult(json.result), credits: Number.isFinite(credits) ? credits : null };
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new EngineError('The check took too long. Please try again.', 504, 'timeout');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// A citation check on another engine, shaped exactly like the Gemini one.
export async function runEngineCitationCheck(
  engine: string,
  topic: string,
  userUrl: string | null,
  state: string | null = null,
  country = 'US'
): Promise<CitationCheckResult & { engine: string; country: string; state: string | null; brandsNamed: string[] }> {
  const t = topic.trim();
  const userDomain = userUrl ? extractDomain(userUrl) : null;
  const answer = await cloroAnswer(engine, t, { country, state });
  const idx = findCitedSourceIndex(answer.sources, userDomain);
  const citedSourceIndex = idx >= 0 ? idx : null;
  const competitors = Array.from(new Set(answer.sources.filter((_, i) => i !== citedSourceIndex).map(s => s.domain)));
  const name = ENGINE_NAMES[engine] || engine;
  return {
    topic: t,
    url: userUrl,
    cited: citedSourceIndex !== null,
    citedSourceIndex,
    sources: answer.sources,
    competitorDomains: competitors,
    siteShared: !!userDomain && !matchableDomain(userDomain),
    summary: buildSummary(!!matchableDomain(userDomain), citedSourceIndex !== null, answer.sources.length, competitors, name),
    answerExcerpt: buildAnswerExcerpt(answer.text),
    engine,
    country,
    state: country === 'US' && state && US_STATES.has(state) ? state : null,
    brandsNamed: answer.entities.slice(0, 10),
  };
}
