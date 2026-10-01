// services/brandVisibilityService.ts — Rain OS AI Brand Visibility Checker
// Uses Gemini with Google Search grounding to check how AI engines see a brand.
import {
  GoogleGenerativeAI,
  FinishReason,
  type GenerativeModel,
  type GenerateContentRequest,
  type Tool,
  type GroundingChunk,
} from '@google/generative-ai';
import { resolveSourceDomain } from './groundingSources';
import { brandInText, tokenizeBrand } from './brandMatch';
import { extractDomain, findCitedSourceIndex } from './citationCheckService';
import { splitSentences, buildAnswerExcerpt } from './textExcerpt';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

interface GoogleSearchTool {
  googleSearch: Record<string, never>;
}
type GroundedTool = Tool | GoogleSearchTool;

interface GroundingSupportSegment {
  text?: string;
  startIndex?: number;
  endIndex?: number;
}
interface GroundingSupport {
  segment?: GroundingSupportSegment;
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}
interface CandidateGroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingChuncks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  groundingSupport?: GroundingSupport[];
}
interface CandidateWithGrounding {
  groundingMetadata?: CandidateGroundingMetadata;
  finishReason?: FinishReason;
}

/**
 * Thrown when the grounded call's candidate finished for any reason other
 * than STOP (e.g. RECITATION, SAFETY, MAX_TOKENS) — the answer is partial
 * or policy-truncated and must not be evaluated as a normal check.
 */
export class GenerationIncompleteError extends Error {
  constructor(public finishReason: FinishReason) {
    super(`Gemini generation did not complete normally (finishReason=${finishReason})`);
    this.name = 'GenerationIncompleteError';
  }
}

export interface BrandVisibilitySource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export type VisibilityMentionStatus = 'mentioned' | 'not_mentioned';
export type VisibilitySentiment = 'positive' | 'neutral' | 'negative' | 'not_applicable';

export interface BrandVisibilityResult {
  brand: string;
  topic: string;
  url: string | null;
  mentionStatus: VisibilityMentionStatus;
  mentionCount: number;
  cited: boolean;
  citedSourceIndex: number | null;
  sentiment: VisibilitySentiment;
  sentimentExplanation: string;
  answerExcerpt: string;
  sources: BrandVisibilitySource[];
  competitors: string[];
  summary: string;
  notMentionedHint: string | null;
}

interface SentimentJson {
  sentiment?: string;
  explanation?: string;
}

// Isolates the (at most 3) sentences that mention the brand, so the
// sentiment call only ever sees a small, real quote — never the full answer.
export function extractMentionSentences(brand: string, text: string): string[] {
  return splitSentences(text)
    .filter(s => brandInText(brand, s))
    .slice(0, 3);
}

/**
 * Build a plain-English summary from facts we actually have — no LLM guess.
 * Only ever references the deterministic mention/citation facts and real
 * competitor domains from the grounding sources.
 */
export function buildSummary(
  brand: string,
  mentioned: boolean,
  cited: boolean,
  competitors: string[]
): string {
  const leaders = competitors.slice(0, 3).join(', ');
  if (mentioned && cited) {
    return `Gemini mentioned ${brand} in its answer, and your site is among the sources it cited.`;
  }
  if (mentioned) {
    return `Gemini mentioned ${brand} in its answer for this topic.`;
  }
  if (cited) {
    return `Gemini didn't mention ${brand} by name, but your site is among the sources it cited.`;
  }
  return `Gemini did not mention ${brand}${leaders ? ` — it favored ${leaders} instead` : ''} when answering this topic.`;
}

// Generic/corporate-suffix words that are never worth surfacing as "the
// brand name that actually matched" — a hint naming "Coffee" or "Inc" would
// be useless even if that word happens to appear in the answer too.
const GENERIC_HINT_WORDS = new Set([
  'coffee', 'inc', 'co', 'company', 'software', 'app', 'llc', 'ltd', 'corp',
  'corporation', 'group', 'store', 'shop', 'bank', 'airlines', 'insurance',
  'technologies', 'tech', 'solutions', 'systems', 'the', 'and', 'of',
]);
const MIN_HINT_TOKEN_LENGTH = 3;

/**
 * When the full brand name wasn't matched, check whether a more distinctive
 * single word from it was — e.g. the user entered "Starbucks coffee" but
 * the answer only ever says "Starbucks". Never loosens the real match: this
 * only ever produces a hint string for the UI, shown alongside an honest
 * "not mentioned" result, never changes mentionStatus itself. Only
 * meaningful for multi-word brand names — a single-word name has no
 * "simpler version" to suggest.
 */
export function buildNotMentionedHint(brand: string, answerText: string): string | null {
  const tokens = tokenizeBrand(brand);
  if (tokens.length <= 1) return null;

  const candidates = tokens.filter(
    t => t.length >= MIN_HINT_TOKEN_LENGTH && !GENERIC_HINT_WORDS.has(t.toLowerCase())
  );
  const matching = candidates.filter(t => brandInText(t, answerText));
  if (matching.length === 0) return null;

  const longest = matching.reduce((a, b) => (b.length > a.length ? b : a));
  return `"${longest}" appears in the answer — try searching with just that name instead of the fuller version.`;
}

export async function runBrandVisibilityCheck(
  brand: string,
  topic: string,
  url: string | null = null
): Promise<BrandVisibilityResult> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');

  const trimmedBrand = brand.trim();
  const trimmedTopic = topic.trim();

  const client = new GoogleGenerativeAI(API_KEY);

  // ─── Step 1: Grounded query — ask about the topic as a user would ─────────
  const groundedTools: GroundedTool[] = [{ googleSearch: {} }];
  const groundedModel: GenerativeModel = client.getGenerativeModel({
    model: MODEL,
    tools: groundedTools as Tool[],
  });

  const groundedPrompt =
    `A user is searching for information about: "${trimmedTopic}".\n\n` +
    `Provide a helpful, comprehensive answer that mentions specific brands, products, tools, or companies ` +
    `that are relevant. Be specific — name actual products and brands rather than staying generic. ` +
    `Answer as you would for a real user researching this topic.`;

  const groundedRequest: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [{ text: groundedPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };
  const groundedResult = await groundedModel.generateContent(groundedRequest);

  const answerText = groundedResult.response.text();
  const candidate = (groundedResult.response.candidates?.[0] || {}) as CandidateWithGrounding;

  // A candidate that didn't finish with STOP (e.g. RECITATION, SAFETY,
  // MAX_TOKENS) produced a partial or policy-truncated answer — evaluating
  // it as a normal check would risk a false "not mentioned". Bail out
  // before any mention/source/sentiment processing.
  if (candidate.finishReason && candidate.finishReason !== FinishReason.STOP) {
    console.error(`[gemini-finish-reason] brand-visibility finishReason=${candidate.finishReason} brand="${trimmedBrand}" topic="${trimmedTopic}"`);
    throw new GenerationIncompleteError(candidate.finishReason);
  }

  const groundingMetadata = candidate.groundingMetadata || {};
  const chunks: GroundingChunk[] =
    groundingMetadata.groundingChunks || groundingMetadata.groundingChuncks || [];
  const supports: GroundingSupport[] =
    groundingMetadata.groundingSupports || groundingMetadata.groundingSupport || [];

  // ─── Build sources from grounding chunks ─────────────────────────────────
  const seen = new Set<string>();
  const sources: BrandVisibilitySource[] = [];
  for (const chunk of chunks) {
    const web = chunk.web;
    const rawUrl = web?.uri || '';
    if (!rawUrl || seen.has(rawUrl)) continue;
    seen.add(rawUrl);
    const domain = resolveSourceDomain(web?.title, rawUrl);
    sources.push({ title: web?.title || domain, url: rawUrl, domain, snippet: '' });
  }

  for (const support of supports) {
    const segmentText = support.segment?.text || '';
    if (!segmentText) continue;
    for (const idx of (support.groundingChunkIndices || [])) {
      if (sources[idx] && !sources[idx].snippet) {
        sources[idx].snippet = segmentText.slice(0, 240);
      }
    }
  }

  // ─── Deterministic mention + citation checks ───────────────────────────────
  // "Mentioned" = the brand's name literally appears in the answer text.
  // "Cited" = the user's own domain shows up among the sources Gemini
  // grounded on. These are two different signals — a domain match in the
  // sources counts as a citation, not as a text mention.
  const mentionSentences = extractMentionSentences(trimmedBrand, answerText);
  const mentionCount = mentionSentences.length;
  const mentioned = mentionCount > 0;
  const mentionStatus: VisibilityMentionStatus = mentioned ? 'mentioned' : 'not_mentioned';
  const notMentionedHint = mentioned ? null : buildNotMentionedHint(trimmedBrand, answerText);

  const userDomain = url ? extractDomain(url) : null;
  const matchIdx = findCitedSourceIndex(sources, userDomain);
  const citedSourceIndex: number | null = matchIdx >= 0 ? matchIdx : null;
  const cited = citedSourceIndex !== null;

  const competitors = Array.from(new Set(
    sources
      .filter((_, i) => i !== citedSourceIndex)
      .map(s => s.domain)
  )).slice(0, 6);

  // ─── Step 2: Sentiment call — only when the brand was actually mentioned ──
  // Skipped entirely when the mention count is 0 (nothing to classify).
  // When it runs, it only sees the up-to-3 quoted sentences that mention
  // the brand — never the full answer or any score/ranking prompt.
  let sentiment: VisibilitySentiment = 'not_applicable';
  let sentimentExplanation = '';

  if (mentioned) {
    const sentimentModel: GenerativeModel = client.getGenerativeModel({ model: MODEL });

    const sentimentPrompt = [
      `Here are the only sentence(s) that mention "${trimmedBrand}" in an AI-generated answer:`,
      ``,
      ...mentionSentences.map((s, i) => `${i + 1}. "${s}"`),
      ``,
      `Classify the tone toward "${trimmedBrand}" in these sentences only. Return a single JSON object:`,
      `{ "sentiment": "positive" | "neutral" | "negative", "explanation": "one short sentence" }`,
      ``,
      `Base your answer only on the quoted sentences above. Respond with valid JSON only, no markdown fences.`,
    ].join('\n');

    const sentimentRequest: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: sentimentPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 200,
        responseMimeType: 'application/json',
      },
    };
    const sentimentResult = await sentimentModel.generateContent(sentimentRequest);
    const raw = sentimentResult.response.text();
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) as SentimentJson;
      sentiment =
        parsed.sentiment === 'positive' ? 'positive'
        : parsed.sentiment === 'negative' ? 'negative'
        : 'neutral';
      sentimentExplanation = typeof parsed.explanation === 'string' ? parsed.explanation : '';
    } catch {
      console.error('Brand sentiment parse error:', raw.slice(0, 300));
      sentiment = 'neutral';
      sentimentExplanation = '';
    }
  }

  return {
    brand: trimmedBrand,
    topic: trimmedTopic,
    url,
    mentionStatus,
    mentionCount,
    cited,
    citedSourceIndex,
    sentiment,
    sentimentExplanation,
    answerExcerpt: buildAnswerExcerpt(answerText),
    sources,
    competitors,
    summary: buildSummary(trimmedBrand, mentioned, cited, competitors),
    notMentionedHint,
  };
}
