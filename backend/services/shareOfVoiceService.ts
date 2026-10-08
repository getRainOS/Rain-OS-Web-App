// services/shareOfVoiceService.ts — Rain OS AI Share of Voice
// Runs 3 prompt phrasings through Google Search-grounded Gemini
// answering behaviour and measures brand visibility across each.
import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type GenerateContentRequest,
  type Tool,
  type GroundingChunk,
} from '@google/generative-ai';
import { resolveSourceDomain } from './groundingSources';
import { brandInText } from './brandMatch';
import { extractDomain, isSameDomain } from './citationCheckService';
import { buildAnswerExcerpt } from './textExcerpt';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/* ── Grounding helpers ────────────────────────────────────────────────────── */
interface GoogleSearchTool { googleSearch: Record<string, never>; }
type GroundedTool = Tool | GoogleSearchTool;

interface CandidateGroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingChuncks?: GroundingChunk[];
}
interface CandidateWithGrounding { groundingMetadata?: CandidateGroundingMetadata; }

/* ── Public types ─────────────────────────────────────────────────────────── */
export interface SovSource {
  title: string;
  url:   string;
  domain: string;
}

export interface ModelResult {
  modelLabel: string;            // e.g. "Informational question"
  modelKey:   string;            // "gemini" | "chatgpt_style" | "perplexity_style"
  promptStyle: string;           // human-readable query style used
  mentioned:   boolean;          // brand found in this prompt's answer text
  answerExcerpt: string;
  sources:     SovSource[];
}

export interface SovResult {
  brand:   string;
  topic:   string;
  url:     string | null;
  mentionedCount: number;          // how many of the 3 prompts mentioned the brand
  modelResults:   ModelResult[];
  domainCitedCount:   number | null;  // N — sources (across all 3 prompts) matching the user's domain; null without a url
  domainSourceCount:  number | null;  // M — total sources across all 3 prompts; null without a url
  domainSharePercent: number | null;  // round(N/M*100); null without a url or when M is 0
  competitors: string[];              // source domains, ranked by frequency across the 3 prompts
  recommendations: string[];          // deterministic next-step advice — see buildRecommendations()
  summary:     string;
}

function extractSources(chunks: GroundingChunk[]): SovSource[] {
  const seen = new Set<string>();
  const sources: SovSource[] = [];
  for (const c of chunks) {
    const rawUrl = c.web?.uri || '';
    if (!rawUrl || seen.has(rawUrl)) continue;
    seen.add(rawUrl);
    const domain = resolveSourceDomain(c.web?.title, rawUrl);
    sources.push({ title: c.web?.title || domain, url: rawUrl, domain });
  }
  return sources;
}

/**
 * Rank source domains by how often they appear across all 3 prompts'
 * source lists (counting each prompt's sources once each, not deduped
 * across prompts — a domain cited by all 3 prompts ranks above one cited
 * by just 1). Excludes the user's own domain, if given.
 */
export function rankCompetitorDomains(
  modelResults: Array<{ sources: SovSource[] }>,
  userDomain: string | null,
  limit = 8
): string[] {
  const counts = new Map<string, number>();
  for (const m of modelResults) {
    for (const s of m.sources) {
      if (userDomain && isSameDomain(s.domain, userDomain)) continue;
      counts.set(s.domain, (counts.get(s.domain) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain]) => domain);
}

export function countMentioned(modelResults: Array<{ mentioned: boolean }>): number {
  return modelResults.filter(m => m.mentioned).length;
}

export interface DomainShare {
  domainCitedCount: number | null;
  domainSourceCount: number | null;
  domainSharePercent: number | null;
}

/**
 * How many of the given sources are the user's own domain, using the same
 * domain matching as Citation Monitor. Only meaningful when a URL was
 * given — all three fields are null without one. Guarded against dividing
 * by zero when there are no sources at all.
 */
export function computeDomainShare(sources: SovSource[], userDomain: string | null): DomainShare {
  if (!userDomain) {
    return { domainCitedCount: null, domainSourceCount: null, domainSharePercent: null };
  }
  const domainSourceCount = sources.length;
  const domainCitedCount = sources.filter(s => isSameDomain(s.domain, userDomain)).length;
  const domainSharePercent = domainSourceCount > 0 ? Math.round((domainCitedCount / domainSourceCount) * 100) : 0;
  return { domainCitedCount, domainSourceCount, domainSharePercent };
}

/**
 * Build a plain-English summary from facts we actually have — no LLM guess.
 */
export function buildSummary(
  brand: string,
  topic: string,
  mentionedCount: number,
  domainSharePercent: number | null,
  domainCitedCount: number | null,
  domainSourceCount: number | null
): string {
  const mentionPart =
    mentionedCount === 0
      ? `${brand} was not mentioned in any of the 3 query phrasings for "${topic}"`
      : mentionedCount === 3
      ? `${brand} was mentioned in all 3 query phrasings for "${topic}"`
      : `${brand} was mentioned in ${mentionedCount} of 3 query phrasings for "${topic}"`;

  if (domainSharePercent === null || domainSourceCount === null || domainCitedCount === null) {
    return `${mentionPart}.`;
  }
  if (domainSourceCount === 0) {
    return `${mentionPart}. Gemini returned no grounded sources across the 3 prompts.`;
  }
  return `${mentionPart}. Your domain is ${domainCitedCount} of ${domainSourceCount} cited sources (${domainSharePercent}%).`;
}

/**
 * Deterministic next-step advice built only from facts this check already
 * produced — no extra LLM call, same "no guessing" rule as buildSummary().
 * Each string names a concrete cause and, where relevant, which Rain OS
 * tool addresses it, so a low share never dead-ends with just a number.
 */
export function buildRecommendations(
  mentionedCount: number,
  domainSharePercent: number | null,
  domainCitedCount: number | null,
  competitors: string[],
  hasUrl: boolean
): string[] {
  const recs: string[] = [];

  if (mentionedCount === 0) {
    recs.push(
      'Gemini never named your brand across any of the 3 phrasings. Run this page through Content Optimizer to strengthen the AI-readable signals (clear headings, direct answers, structured facts) that get a brand mentioned by name.'
    );
  }

  if (!hasUrl) {
    recs.push(
      'Add your website URL next time you run this check — without it, we can only tell you whether you were mentioned by name, not whether your domain is actually among the cited sources.'
    );
  } else if (domainSharePercent !== null && domainCitedCount === 0 && competitors.length > 0) {
    recs.push(
      `Your domain wasn't cited at all, while ${competitors[0]} was. Run URL Scanner on the page you want cited — missing schema markup or weak page structure is the most common reason Google's grounded search skips a page in favor of a competitor's.`
    );
  } else if (domainSharePercent !== null && domainSharePercent > 0 && domainSharePercent < 50 && competitors.length > 0) {
    recs.push(
      `${competitors[0]} is cited more often than you for this topic. Compare its page against yours in URL Scanner to see which structural signals it has that yours doesn't.`
    );
  } else if (domainSharePercent !== null && domainSharePercent >= 50) {
    recs.push(
      "You're already the leading cited source for this topic — re-run this check periodically to catch a new competitor before they close the gap."
    );
  }

  return recs;
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Core runner — executes one grounded prompt, returns structured result      *
 * ─────────────────────────────────────────────────────────────────────────── */
async function runOneModel(
  client: GoogleGenerativeAI,
  brand: string,
  modelConfig: {
    modelLabel: string;
    modelKey:   string;
    promptStyle: string;
    userPrompt:  string;
  }
): Promise<ModelResult> {
  const { modelLabel, modelKey, promptStyle, userPrompt } = modelConfig;

  const tools: GroundedTool[]   = [{ googleSearch: {} }];
  const gModel: GenerativeModel = client.getGenerativeModel({ model: MODEL, tools: tools as Tool[] });
  const req: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
  };
  const res = await gModel.generateContent(req);
  const answerText = res.response.text();
  const cand = (res.response.candidates?.[0] || {}) as CandidateWithGrounding;
  const gm   = cand.groundingMetadata || {};
  const chunks: GroundingChunk[] = gm.groundingChunks || gm.groundingChuncks || [];
  const sources = extractSources(chunks);

  return {
    modelLabel,
    modelKey,
    promptStyle,
    mentioned: brandInText(brand, answerText),
    answerExcerpt: buildAnswerExcerpt(answerText),
    sources: sources.slice(0, 6),
  };
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Main export                                                                 *
 * ─────────────────────────────────────────────────────────────────────────── */
export async function runShareOfVoice(
  brand: string,
  topic: string,
  url:   string | null = null
): Promise<SovResult> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');

  const client = new GoogleGenerativeAI(API_KEY);
  const b = brand.trim();
  const t = topic.trim();
  const userDomain = url ? extractDomain(url) : null;

  const modelConfigs = [
    {
      modelLabel:  'Informational question',
      modelKey:    'gemini',
      promptStyle: '"What are the best tools for…?"',
      userPrompt:  `What are the best tools, products, or services for: "${t}"? Name specific brands and products, not generic categories. Be specific and helpful.`,
    },
    {
      modelLabel:  'Conversational request',
      modelKey:    'chatgpt_style',
      promptStyle: '"I need help with… what do you recommend?"',
      userPrompt:  `I need help with "${t}". What would you personally recommend? Give me your top picks with reasons, naming specific products or companies.`,
    },
    {
      modelLabel:  'Research comparison',
      modelKey:    'perplexity_style',
      promptStyle: '"Compare the top solutions for… with sources"',
      userPrompt:  `Research and compare the leading solutions for "${t}". Which brands or tools dominate this space? Include any notable mentions, market leaders, and emerging players.`,
    },
  ];

  // Run all 3 grounded prompts in parallel — one Gemini call each, no
  // second "analysis" call.
  const modelResults = await Promise.all(
    modelConfigs.map(cfg => runOneModel(client, b, cfg))
  );

  const mentionedCount = countMentioned(modelResults);

  // Domain share across all sources cited by the 3 prompts combined.
  const allSources = modelResults.flatMap(m => m.sources);
  const { domainCitedCount, domainSourceCount, domainSharePercent } = computeDomainShare(allSources, userDomain);

  const competitors = rankCompetitorDomains(modelResults, userDomain);
  const recommendations = buildRecommendations(mentionedCount, domainSharePercent, domainCitedCount, competitors, !!userDomain);

  return {
    brand: b,
    topic: t,
    url,
    mentionedCount,
    modelResults,
    domainCitedCount,
    domainSourceCount,
    domainSharePercent,
    competitors,
    recommendations,
    summary: buildSummary(b, t, mentionedCount, domainSharePercent, domainCitedCount, domainSourceCount),
  };
}
