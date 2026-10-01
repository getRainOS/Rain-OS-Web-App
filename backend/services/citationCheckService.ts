// services/citationCheckService.ts — Rain OS AI Citation Monitor
// Uses Gemini with Google Search grounding to test whether a user's content
// would be cited by AI engines when answering a given topic/question.
import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type GenerateContentRequest,
  type Tool,
  type GroundingChunk,
} from '@google/generative-ai';
import { resolveSourceDomain } from './groundingSources';
import { buildAnswerExcerpt } from './textExcerpt';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Gemini 2.0+ uses the `googleSearch` tool; the @google/generative-ai SDK
// only ships the older `googleSearchRetrieval` shape in its public types.
// Declare the new shape locally so we can build a properly typed Tool.
interface GoogleSearchTool {
  googleSearch: Record<string, never>;
}
type GroundedTool = Tool | GoogleSearchTool;

// The grounding response uses both old (`groundingChuncks` typo, `groundingSupport`)
// and new (`groundingChunks`, `groundingSupports`) field names depending on
// SDK / API version. Declare a forgiving shape that covers both.
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
}

export interface CitationSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface CitationCheckResult {
  topic: string;
  url: string | null;
  cited: boolean;
  citedSourceIndex: number | null;
  sources: CitationSource[];
  competitorDomains: string[];
  summary: string;
  answerExcerpt: string;
}

export function extractDomain(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

/**
 * Build a plain-English summary from facts we actually have — no LLM guess.
 * Only ever references cited, how many sources were returned, and (when
 * relevant) which domains compete for the citation.
 */
function buildSummary(
  hasUrl: boolean,
  cited: boolean,
  sourcesCount: number,
  competitorDomains: string[]
): string {
  if (sourcesCount === 0) {
    return 'Gemini returned no grounded sources for this query.';
  }
  const plural = sourcesCount === 1 ? '' : 's';
  const leaders = competitorDomains.slice(0, 3).join(', ');
  if (!hasUrl) {
    return `Gemini cited ${sourcesCount} source${plural} for this query${leaders ? ` — currently led by ${leaders}` : ''}.`;
  }
  if (cited) {
    return `Your site is among the ${sourcesCount} source${plural} Gemini cited for this query.`;
  }
  return `Your site was not among the ${sourcesCount} source${plural} Gemini cited for this query${leaders ? ` — currently led by ${leaders}` : ''}.`;
}

/**
 * Whether two domains should be treated as the same site. Matches on:
 *  - exact host match (after stripping www.)
 *  - `domain` is a subdomain of `userDomain` (domain endsWith "." + userDomain)
 *  - `userDomain` is a subdomain of `domain` (userDomain endsWith "." + domain)
 */
export function isSameDomain(domain: string, userDomain: string): boolean {
  return (
    domain === userDomain ||
    domain.endsWith('.' + userDomain) ||
    userDomain.endsWith('.' + domain)
  );
}

/**
 * Find the index of the first source whose domain matches the user's domain.
 * Returns -1 when there is no user domain or no match.
 */
export function findCitedSourceIndex(
  sources: Array<{ domain: string }>,
  userDomain: string | null
): number {
  if (!userDomain) return -1;
  return sources.findIndex(s => isSameDomain(s.domain, userDomain));
}

export async function runCitationCheck(
  topic: string,
  userUrl: string | null = null
): Promise<CitationCheckResult> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const trimmedTopic = topic.trim();
  if (!trimmedTopic) {
    throw new Error('topic is required');
  }

  const userDomain = userUrl ? extractDomain(userUrl) : null;
  const client = new GoogleGenerativeAI(API_KEY);

  // ─── Step 1: Grounded query — ask Gemini the topic as if a user asked it ──
  // Build the tools array as our extended type, then narrow to Tool[] at the
  // single boundary where the SDK accepts it. This keeps the rest of the
  // function fully typed without sprinkling `any` casts.
  const groundedTools: GroundedTool[] = [{ googleSearch: {} }];
  const groundedModel: GenerativeModel = client.getGenerativeModel({
    model: MODEL,
    tools: groundedTools as Tool[],
  });

  const groundedPrompt =
    `A user is asking an AI assistant the following question. ` +
    `Answer it as you would for them, citing the most authoritative current sources from the web.\n\n` +
    `QUESTION: ${trimmedTopic}\n\n` +
    `Provide a concise, factual answer (2-4 short paragraphs). Cite sources naturally.`;

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
  const groundingMetadata: CandidateGroundingMetadata = candidate.groundingMetadata || {};
  const chunks: GroundingChunk[] =
    groundingMetadata.groundingChunks || groundingMetadata.groundingChuncks || [];
  const supports: GroundingSupport[] =
    groundingMetadata.groundingSupports || groundingMetadata.groundingSupport || [];

  // ─── Build the sources list from grounding chunks ─────────────────────────
  const seen = new Set<string>();
  const sources: CitationSource[] = [];
  for (const chunk of chunks) {
    const web = chunk.web;
    const rawUrl = web?.uri || '';
    if (!rawUrl) continue;
    const domain = resolveSourceDomain(web?.title, rawUrl);
    if (seen.has(rawUrl)) continue;
    seen.add(rawUrl);
    sources.push({
      title: web?.title || domain || 'Untitled source',
      url: rawUrl,
      domain,
      snippet: '',
    });
  }

  // Attach snippets from grounding supports text segments where possible
  for (const support of supports) {
    const indices = support.groundingChunkIndices || [];
    const segmentText = support.segment?.text || '';
    if (!segmentText) continue;
    for (const idx of indices) {
      if (sources[idx] && !sources[idx].snippet) {
        sources[idx].snippet = segmentText.slice(0, 240);
      }
    }
  }

  // Citation match against user's domain
  const matchIdx = findCitedSourceIndex(sources, userDomain);
  const citedSourceIndex: number | null = matchIdx >= 0 ? matchIdx : null;
  const cited = citedSourceIndex !== null;

  const dedupedCompetitors = Array.from(new Set(
    sources
      .filter((_, i) => i !== citedSourceIndex)
      .map(s => s.domain)
  ));

  return {
    topic: trimmedTopic,
    url: userUrl || null,
    cited,
    citedSourceIndex,
    sources,
    competitorDomains: dedupedCompetitors,
    summary: buildSummary(!!userUrl, cited, sources.length, dedupedCompetitors),
    answerExcerpt: buildAnswerExcerpt(answerText),
  };
}
