// services/brandVisibilityService.ts — Rain OS AI Brand Visibility Checker
// Uses Gemini with Google Search grounding to check how AI engines see a brand.
import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type GenerateContentRequest,
  type Tool,
  type GroundingChunk,
} from '@google/generative-ai';

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
}

export interface BrandVisibilitySource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export type VisibilityMentionStatus = 'mentioned' | 'not_mentioned' | 'ambiguous';
export type VisibilitySentiment = 'positive' | 'neutral' | 'negative' | 'not_applicable';

export interface BrandVisibilityResult {
  brand: string;
  topic: string;
  url: string | null;
  visibilityScore: number;
  mentionStatus: VisibilityMentionStatus;
  mentionPosition: number | null;
  sentiment: VisibilitySentiment;
  sentimentExplanation: string;
  answerExcerpt: string;
  sources: BrandVisibilitySource[];
  competitors: string[];
  recommendations: string[];
  summary: string;
}

interface AnalysisJson {
  visibilityScore?: number;
  mentionStatus?: string;
  mentionPosition?: number | null;
  sentiment?: string;
  sentimentExplanation?: string;
  summary?: string;
  competitors?: string[];
  recommendations?: string[];
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function brandInText(brand: string, text: string): boolean {
  const needle = brand.trim().toLowerCase();
  return text.toLowerCase().includes(needle);
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
    let domain = '';
    try {
      domain = new URL(rawUrl).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      domain = rawUrl.replace(/^https?:\/\//, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
    }
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

  // ─── Quick local mention check ───────────────────────────────────────────
  const localMentioned = brandInText(trimmedBrand, answerText);

  // ─── Step 2: Structured analysis call ────────────────────────────────────
  const analysisModel: GenerativeModel = client.getGenerativeModel({ model: MODEL });

  const analysisPrompt = [
    `You are an AI Brand Visibility analyst. Your job is to assess how visible and well-represented a brand is in AI-generated answers.`,
    ``,
    `BRAND NAME: ${trimmedBrand}`,
    `TOPIC / QUERY: ${trimmedTopic}`,
    `BRAND WEBSITE: ${url || '(not provided)'}`,
    ``,
    `AI ANSWER FOR THIS TOPIC:`,
    answerText.slice(0, 2000),
    ``,
    `SOURCES AI CITED:`,
    sources.length === 0
      ? '(none)'
      : sources.map((s, i) => `${i + 1}. ${s.title} — ${s.domain}`).join('\n'),
    ``,
    `LOCAL MENTION CHECK: The brand "${trimmedBrand}" ${localMentioned ? 'IS' : 'is NOT'} found in the answer text above.`,
    ``,
    `Analyse the above and return a single JSON object with this exact shape:`,
    `{`,
    `  "visibilityScore": 0,`,
    `  "mentionStatus": "mentioned",`,
    `  "mentionPosition": null,`,
    `  "sentiment": "neutral",`,
    `  "sentimentExplanation": "string",`,
    `  "summary": "string",`,
    `  "competitors": ["domain1", "domain2"],`,
    `  "recommendations": ["string", "string", "string"]`,
    `}`,
    ``,
    `Rules:`,
    `- visibilityScore: 0-100. If brand is clearly mentioned and praised: 70-95. If mentioned briefly or ambiguously: 40-65. If not mentioned at all: 5-35.`,
    `- mentionStatus: "mentioned" if the brand clearly appears, "not_mentioned" if absent, "ambiguous" if unclear.`,
    `- mentionPosition: the approximate rank/position (1 = first brand mentioned, null if not mentioned). Integer or null.`,
    `- sentiment: "positive" / "neutral" / "negative" / "not_applicable" (use not_applicable if brand is not mentioned).`,
    `- sentimentExplanation: 1 sentence describing how AI portrays the brand, or why it's absent.`,
    `- summary: 1-2 sentences plain-English summary of the brand's visibility situation.`,
    `- competitors: list of brand names or domains that were mentioned instead of / alongside this brand (max 6).`,
    `- recommendations: 3-4 specific, actionable steps to improve AI visibility for this brand and topic.`,
    `- Respond with valid JSON only. No markdown fences, no preamble.`,
  ].join('\n');

  const analysisRequest: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 900,
      responseMimeType: 'application/json',
    },
  };
  const analysisResult = await analysisModel.generateContent(analysisRequest);

  const rawAnalysis = analysisResult.response.text();
  let analysis: AnalysisJson = {};
  try {
    analysis = JSON.parse(rawAnalysis.replace(/```json|```/g, '').trim()) as AnalysisJson;
  } catch {
    console.error('Brand visibility parse error:', rawAnalysis.slice(0, 400));
    analysis = {
      visibilityScore: localMentioned ? 55 : 20,
      mentionStatus: localMentioned ? 'mentioned' : 'not_mentioned',
      mentionPosition: null,
      sentiment: 'not_applicable',
      sentimentExplanation: localMentioned
        ? `${trimmedBrand} appears in the AI answer for this topic.`
        : `${trimmedBrand} was not found in AI answers for "${trimmedTopic}".`,
      summary: localMentioned
        ? `${trimmedBrand} is mentioned when AI answers questions about ${trimmedTopic}.`
        : `${trimmedBrand} is not currently visible in AI answers about ${trimmedTopic}.`,
      competitors: sources.slice(0, 4).map(s => s.domain),
      recommendations: [
        'Create comprehensive, answer-first content that directly addresses common questions about your topic.',
        'Build authoritative backlinks from sources that AI already cites for this topic.',
        'Add structured data (FAQ, HowTo, Product schema) to help AI engines extract and cite your brand.',
        'Publish case studies and comparison pages that include your brand alongside established competitors.',
      ],
    };
  }

  const mentionStatus: VisibilityMentionStatus =
    analysis.mentionStatus === 'mentioned' ? 'mentioned'
    : analysis.mentionStatus === 'ambiguous' ? 'ambiguous'
    : 'not_mentioned';

  const sentiment: VisibilitySentiment =
    analysis.sentiment === 'positive' ? 'positive'
    : analysis.sentiment === 'negative' ? 'negative'
    : analysis.sentiment === 'neutral' ? 'neutral'
    : 'not_applicable';

  return {
    brand: trimmedBrand,
    topic: trimmedTopic,
    url,
    visibilityScore: clamp(analysis.visibilityScore ?? (localMentioned ? 55 : 20)),
    mentionStatus,
    mentionPosition: typeof analysis.mentionPosition === 'number' ? analysis.mentionPosition : null,
    sentiment,
    sentimentExplanation: typeof analysis.sentimentExplanation === 'string'
      ? analysis.sentimentExplanation
      : '',
    answerExcerpt: answerText.slice(0, 800),
    sources,
    competitors: Array.isArray(analysis.competitors)
      ? analysis.competitors.slice(0, 6).map(c => String(c))
      : [],
    recommendations: Array.isArray(analysis.recommendations)
      ? analysis.recommendations.slice(0, 4).map(r => String(r))
      : [],
    summary: typeof analysis.summary === 'string' ? analysis.summary : '',
  };
}
