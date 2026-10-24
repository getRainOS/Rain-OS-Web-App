// services/engines/dataforseo.ts — Google AI Overviews, Google AI Mode,
// Perplexity and Claude through DataForSEO.
//
// UNVERIFIED: written from DataForSEO's documented API and tested only
// against sample responses (__tests__/fixtures/dataforseo/). These engines stay
// off until DATAFORSEO_VERIFIED=true is set after a real call checks out, so
// a wrong guess about the response shape can't reach customers.
//
//   AI Overviews  POST /v3/serp/google/organic/live/advanced  (ai_overview item)
//   AI Mode       POST /v3/serp/google/ai_mode/live/advanced
//   Perplexity    POST /v3/ai_optimization/perplexity/llm_responses/live
//   Claude        POST /v3/ai_optimization/claude/llm_responses/live
// Auth is HTTP Basic with the account login and API password.
import { extractDomain, findCitedSourceIndex, buildSummary, type CitationCheckResult, type CitationSource } from '../citationCheckService';
import { matchableDomain } from '../sharedPlatforms';
import { buildAnswerExcerpt } from '../textExcerpt';
import { US_STATE_NAMES } from './location';
import { EngineError } from './engineError';

const BASE = 'https://api.dataforseo.com/v3';

export type DfsEngine = 'ai_overviews' | 'ai_mode' | 'perplexity' | 'claude';
export const DFS_ENGINE_NAMES: Record<DfsEngine, string> = {
  ai_overviews: 'Google AI Overviews',
  ai_mode: 'Google AI Mode',
  perplexity: 'Perplexity',
  claude: 'Claude',
};
const PATHS: Record<DfsEngine, string> = {
  ai_overviews: '/serp/google/organic/live/advanced',
  ai_mode: '/serp/google/ai_mode/live/advanced',
  perplexity: '/ai_optimization/perplexity/llm_responses/live',
  claude: '/ai_optimization/claude/llm_responses/live',
};

export function dataforseoConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env.DATAFORSEO_LOGIN && !!env.DATAFORSEO_PASSWORD;
}

// "Texas,United States" or "United Kingdom", the form DataForSEO's
// location_name takes.
export function locationName(country = 'US', state: string | null = null): string {
  let name = 'United States';
  try { name = new Intl.DisplayNames(['en'], { type: 'region' }).of(country) || country; } catch { name = country; }
  if (country === 'US') name = 'United States';
  return country === 'US' && state && US_STATE_NAMES[state] ? `${US_STATE_NAMES[state]},United States` : name;
}

export function buildTask(engine: DfsEngine, prompt: string, country = 'US', state: string | null = null): Record<string, unknown> {
  if (engine === 'ai_overviews' || engine === 'ai_mode') {
    return {
      keyword: prompt,
      location_name: locationName(country, state),
      language_code: 'en',
      device: 'desktop',
      ...(engine === 'ai_overviews' ? { load_async_ai_overview: true } : {}),
    };
  }
  // LLM responses take no location; the question carries any place name.
  return { user_prompt: prompt, web_search: true, max_output_tokens: 1200 };
}

// Walk a result and collect every cited URL in order, plus the answer text.
// Deliberately tolerant of shape: references, annotations and sources are all
// read, wherever they sit, so small differences between the documented and
// real responses don't lose citations.
function harvest(node: any, out: { urls: Array<{ url: string; title: string }>; text: string[] }, inAnswer: boolean) {
  if (Array.isArray(node)) { node.forEach(n => harvest(n, out, inAnswer)); return; }
  if (!node || typeof node !== 'object') return;
  const url = typeof node.url === 'string' ? node.url : '';
  if (url && /^https?:\/\//i.test(url) && inAnswer) {
    out.urls.push({ url, title: String(node.title || node.source || node.domain || '') });
  }
  if (inAnswer && typeof node.text === 'string' && !url) out.text.push(node.text);
  if (inAnswer && typeof node.markdown === 'string') out.text.push(node.markdown);
  for (const [k, v] of Object.entries(node)) {
    if (k === 'url' || typeof v !== 'object' || v === null) continue;
    harvest(v, out, inAnswer);
  }
}

export interface DfsAnswer { text: string; sources: CitationSource[]; present: boolean; cost: number | null }

export function parseDataforseo(engine: DfsEngine, json: any): DfsAnswer {
  const task = json?.tasks?.[0];
  const result = task?.result?.[0];
  const cost = typeof task?.cost === 'number' ? task.cost : typeof json?.cost === 'number' ? json.cost : null;
  const out = { urls: [] as Array<{ url: string; title: string }>, text: [] as string[] };
  let present = false;

  if (engine === 'ai_overviews' || engine === 'ai_mode') {
    // Only the AI answer block counts, not the blue links under it.
    const items: any[] = Array.isArray(result?.items) ? result.items : [];
    const answers = items.filter(i => i?.type === 'ai_overview' || i?.type === 'ai_mode');
    present = answers.length > 0;
    harvest(answers, out, true);
  } else {
    present = !!result;
    harvest(result?.items ?? result?.sections ?? result, out, true);
  }

  const seen = new Set<string>();
  const sources: CitationSource[] = [];
  for (const { url, title } of out.urls) {
    const clean = url.replace(/#.*$/, '');
    if (seen.has(clean)) continue;
    seen.add(clean);
    const domain = extractDomain(clean);
    sources.push({ title: title || domain, url: clean, domain, snippet: '' });
  }
  return { text: out.text.join('\n').trim(), sources, present, cost };
}

export async function dataforseoAnswer(
  engine: DfsEngine,
  prompt: string,
  opts: { country?: string; state?: string | null; timeoutMs?: number } = {}
): Promise<DfsAnswer> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new EngineError(`${DFS_ENGINE_NAMES[engine]} checks are not set up yet.`, 503, 'engine_unavailable');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120000);
  try {
    const res = await fetch(`${BASE}${PATHS[engine]}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([buildTask(engine, prompt, opts.country, opts.state ?? null)]),
      signal: ctrl.signal,
    });
    const json: any = await res.json().catch(() => ({}));
    const taskStatus = json?.tasks?.[0]?.status_code;
    if (!res.ok || json?.status_code !== 20000 || (taskStatus && taskStatus !== 20000)) {
      const msg = json?.tasks?.[0]?.status_message || json?.status_message || `Request failed (${res.status})`;
      console.error(`[dataforseo] ${engine} failed:`, json?.status_code, taskStatus, msg);
      throw new EngineError(`${DFS_ENGINE_NAMES[engine]} is temporarily unavailable. Try again later.`, 503, 'engine_unavailable');
    }
    return parseDataforseo(engine, json);
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new EngineError('The check took too long. Please try again.', 504, 'timeout');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function runDataforseoCitationCheck(
  engine: DfsEngine,
  topic: string,
  userUrl: string | null,
  state: string | null = null,
  country = 'US'
): Promise<CitationCheckResult & { engine: string; country: string; state: string | null; brandsNamed: string[]; answerShown: boolean }> {
  const t = topic.trim();
  const userDomain = userUrl ? extractDomain(userUrl) : null;
  const answer = await dataforseoAnswer(engine, t, { country, state });
  const idx = findCitedSourceIndex(answer.sources, userDomain);
  const citedSourceIndex = idx >= 0 ? idx : null;
  const competitors = Array.from(new Set(answer.sources.filter((_, i) => i !== citedSourceIndex).map(s => s.domain)));
  const name = DFS_ENGINE_NAMES[engine];
  // Google doesn't show an AI Overview for every search. Say so plainly
  // rather than reporting "not cited" for an answer that didn't exist.
  const summary = !answer.present && (engine === 'ai_overviews' || engine === 'ai_mode')
    ? `Google didn't show ${engine === 'ai_mode' ? 'an AI Mode answer' : 'an AI Overview'} for this search, so no site was cited.`
    : buildSummary(!!matchableDomain(userDomain), citedSourceIndex !== null, answer.sources.length, competitors, name);
  return {
    topic: t,
    url: userUrl,
    cited: citedSourceIndex !== null,
    citedSourceIndex,
    sources: answer.sources,
    competitorDomains: competitors,
    siteShared: !!userDomain && !matchableDomain(userDomain),
    summary,
    answerExcerpt: buildAnswerExcerpt(answer.text),
    answerText: answer.text,
    engine,
    country: engine === 'ai_overviews' || engine === 'ai_mode' ? country : 'US',
    state: (engine === 'ai_overviews' || engine === 'ai_mode') && country === 'US' ? state : null,
    brandsNamed: [],
    answerShown: answer.present,
  };
}
