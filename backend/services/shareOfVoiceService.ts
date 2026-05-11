// services/shareOfVoiceService.ts — Rain OS AI Share of Voice
// Runs 3 prompt styles through Gemini to simulate Gemini / ChatGPT / Perplexity
// answering behaviour and measures brand visibility across each.
import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type GenerateContentRequest,
  type Tool,
  type GroundingChunk,
} from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/* ── Grounding helpers ────────────────────────────────────────────────────── */
interface GoogleSearchTool { googleSearch: Record<string, never>; }
type GroundedTool = Tool | GoogleSearchTool;

interface GroundingSupportSegment { text?: string; startIndex?: number; endIndex?: number; }
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
interface CandidateWithGrounding { groundingMetadata?: CandidateGroundingMetadata; }

/* ── Public types ─────────────────────────────────────────────────────────── */
export interface SovSource {
  title: string;
  url:   string;
  domain: string;
}

export interface ModelResult {
  modelLabel: string;            // e.g. "Gemini (Informational)"
  modelKey:   string;            // "gemini" | "chatgpt_style" | "perplexity_style"
  promptStyle: string;           // human-readable query style used
  cited:           boolean;
  mentionPosition: number | null;
  visibilityScore: number;       // 0-100
  answerExcerpt:   string;
  sources:         SovSource[];
  competitorDomains: string[];
}

export interface SovResult {
  brand:   string;
  topic:   string;
  url:     string | null;
  overallSov:      number;       // avg visibility score across models, 0-100
  citedCount:      number;       // how many of the 3 models cited the brand
  modelResults:    ModelResult[];
  topCompetitors:  string[];     // union of competitor domains across models
  recommendations: string[];
  aiVolumeLabel:   'Low' | 'Medium' | 'High' | 'Very High';
  aiVolumeEstimate: string;      // e.g. "10k – 50k queries/month"
  summary:         string;
}

/* ── Internal ─────────────────────────────────────────────────────────────── */
interface AnalysisJson {
  visibilityScore?:    number;
  cited?:              boolean;
  mentionPosition?:    number | null;
  competitorDomains?:  string[];
  summary?:            string;
  recommendations?:    string[];
}

function clamp(n: number): number { return Math.max(0, Math.min(100, Math.round(n))); }
function brandInText(brand: string, text: string): boolean {
  return text.toLowerCase().includes(brand.trim().toLowerCase());
}

function extractSources(
  chunks: GroundingChunk[],
  supports: GroundingSupport[]
): SovSource[] {
  const seen = new Set<string>();
  const sources: SovSource[] = [];
  for (const c of chunks) {
    const rawUrl = c.web?.uri || '';
    if (!rawUrl || seen.has(rawUrl)) continue;
    seen.add(rawUrl);
    let domain = '';
    try { domain = new URL(rawUrl).hostname.replace(/^www\./i, '').toLowerCase(); }
    catch { domain = rawUrl.replace(/^https?:\/\//, '').replace(/^www\./i, '').split('/')[0].toLowerCase(); }
    sources.push({ title: c.web?.title || domain, url: rawUrl, domain });
  }
  void supports; // used by caller for snippets if needed
  return sources;
}

function estimateAiVolume(topic: string): { label: SovResult['aiVolumeLabel']; estimate: string } {
  const words = topic.trim().toLowerCase().split(/\s+/);
  const len   = words.length;

  // Broad head terms → higher volume
  const headTerms = ['ai', 'best', 'how to', 'what is', 'top', 'compare', 'vs', 'review'];
  const isHead    = words.some(w => headTerms.includes(w));
  const isBroad   = len <= 4;
  const isNiche   = len >= 7;

  if (isHead && isBroad) return { label: 'Very High', estimate: '100k – 500k queries/mo (est.)' };
  if (isHead && !isNiche) return { label: 'High',      estimate: '50k – 200k queries/mo (est.)' };
  if (isBroad)            return { label: 'Medium',    estimate: '10k – 50k queries/mo (est.)' };
  if (isNiche)            return { label: 'Low',       estimate: '1k – 10k queries/mo (est.)' };
  return                         { label: 'Medium',    estimate: '10k – 50k queries/mo (est.)' };
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Core runner — executes one prompt style, returns structured result         *
 * ─────────────────────────────────────────────────────────────────────────── */
async function runOneModel(
  client: GoogleGenerativeAI,
  brand: string,
  topic: string,
  modelConfig: {
    modelLabel: string;
    modelKey:   string;
    promptStyle: string;
    userPrompt:  string;
    grounded:    boolean;
  }
): Promise<ModelResult> {
  const { modelLabel, modelKey, promptStyle, userPrompt, grounded } = modelConfig;

  let answerText = '';
  let sources:    SovSource[] = [];

  if (grounded) {
    const tools: GroundedTool[]    = [{ googleSearch: {} }];
    const gModel: GenerativeModel  = client.getGenerativeModel({ model: MODEL, tools: tools as Tool[] });
    const req: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    };
    const res = await gModel.generateContent(req);
    answerText = res.response.text();
    const cand = (res.response.candidates?.[0] || {}) as CandidateWithGrounding;
    const gm   = cand.groundingMetadata || {};
    const chunks: GroundingChunk[]   = gm.groundingChunks || gm.groundingChuncks || [];
    const supports: GroundingSupport[] = gm.groundingSupports || gm.groundingSupport || [];
    sources = extractSources(chunks, supports);
  } else {
    const model: GenerativeModel = client.getGenerativeModel({ model: MODEL });
    const req: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    };
    const res = await model.generateContent(req);
    answerText = res.response.text();
  }

  const localMentioned = brandInText(brand, answerText);

  // Structured analysis
  const analysisModel: GenerativeModel = client.getGenerativeModel({ model: MODEL });
  const analysisPrompt = [
    `You are an AI citation analyst. Assess how visible the brand "${brand}" is in the following AI-generated answer for the topic "${topic}".`,
    ``,
    `AI ANSWER:`,
    answerText.slice(0, 2000),
    ``,
    `SOURCES CITED:`,
    sources.length === 0 ? '(none)' : sources.map((s, i) => `${i+1}. ${s.domain}`).join('\n'),
    ``,
    `LOCAL MENTION CHECK: The brand "${brand}" ${localMentioned ? 'IS' : 'is NOT'} found verbatim.`,
    ``,
    `Return a single JSON object:`,
    `{`,
    `  "visibilityScore": 0,`,
    `  "cited": false,`,
    `  "mentionPosition": null,`,
    `  "competitorDomains": [],`,
    `  "summary": "string",`,
    `  "recommendations": ["string","string","string"]`,
    `}`,
    ``,
    `Rules:`,
    `- visibilityScore: 0-100. Clearly mentioned+praised: 70-95. Brief/ambiguous: 30-65. Not mentioned: 5-30.`,
    `- cited: true if brand clearly appears; false otherwise.`,
    `- mentionPosition: 1-based rank (1=first brand named), null if not mentioned.`,
    `- competitorDomains: up to 5 domains/brands mentioned INSTEAD of or alongside the brand.`,
    `- summary: 1 sentence plain-English.`,
    `- recommendations: 2-3 specific actions.`,
    `- Respond with valid JSON only. No markdown fences.`,
  ].join('\n');

  const aRes = await analysisModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 600, responseMimeType: 'application/json' },
  });

  let a: AnalysisJson = {};
  try { a = JSON.parse(aRes.response.text().replace(/```json|```/g, '').trim()) as AnalysisJson; }
  catch { a = { visibilityScore: localMentioned ? 50 : 15, cited: localMentioned }; }

  return {
    modelLabel,
    modelKey,
    promptStyle,
    cited:            a.cited ?? localMentioned,
    mentionPosition:  typeof a.mentionPosition === 'number' ? a.mentionPosition : null,
    visibilityScore:  clamp(a.visibilityScore ?? (localMentioned ? 50 : 15)),
    answerExcerpt:    answerText.slice(0, 500),
    sources:          sources.slice(0, 6),
    competitorDomains: Array.isArray(a.competitorDomains)
      ? a.competitorDomains.slice(0, 5).map(d => String(d))
      : [],
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

  const modelConfigs = [
    {
      modelLabel:  'Gemini',
      modelKey:    'gemini',
      promptStyle: 'Informational — "What are the best tools for…?"',
      userPrompt:  `What are the best tools, products, or services for: "${t}"? Name specific brands and products, not generic categories. Be specific and helpful.`,
      grounded:    true,
    },
    {
      modelLabel:  'ChatGPT-style',
      modelKey:    'chatgpt_style',
      promptStyle: 'Conversational — "I need help with… what do you recommend?"',
      userPrompt:  `I need help with "${t}". What would you personally recommend? Give me your top picks with reasons, naming specific products or companies.`,
      grounded:    false,
    },
    {
      modelLabel:  'Perplexity-style',
      modelKey:    'perplexity_style',
      promptStyle: 'Research — "Compare the top solutions for… with sources"',
      userPrompt:  `Research and compare the leading solutions for "${t}". Which brands or tools dominate this space? Include any notable mentions, market leaders, and emerging players.`,
      grounded:    true,
    },
  ];

  // Run all 3 in parallel
  const modelResults = await Promise.all(
    modelConfigs.map(cfg => runOneModel(client, b, t, cfg))
  );

  const overallSov  = Math.round(
    modelResults.reduce((s, m) => s + m.visibilityScore, 0) / modelResults.length
  );
  const citedCount  = modelResults.filter(m => m.cited).length;

  // Union of competitor domains
  const competitorSet = new Set<string>();
  for (const m of modelResults) {
    for (const d of m.competitorDomains) competitorSet.add(d);
  }
  const topCompetitors = [...competitorSet].slice(0, 8);

  // Aggregate recommendations from the model that scored lowest (most to improve)
  const weakest      = [...modelResults].sort((a, b) => a.visibilityScore - b.visibilityScore)[0];
  const recommendations: string[] = [];
  if (citedCount === 0) {
    recommendations.push(
      `None of the three AI models cited ${b} for this topic — start by publishing answer-first content that directly addresses "${t}".`,
      `Earn backlinks from domains already being cited (${topCompetitors.slice(0,3).join(', ')}).`,
      `Add FAQ and HowTo structured data so AI engines can extract and attribute your expertise.`,
    );
  } else if (citedCount < 3) {
    recommendations.push(
      `${b} is cited by ${citedCount}/3 AI models — expand your content to address conversational and research-style queries, not just informational ones.`,
      `Target the ${3 - citedCount} AI model style(s) that did not cite you with dedicated content formats.`,
      `Consistently publish updated comparisons and case studies to reinforce authority.`,
    );
  } else {
    recommendations.push(
      `${b} appears in all 3 AI model styles — protect this by keeping content fresh and updated.`,
      `Improve mention position by being the first brand named; use strong answer-first headlines.`,
      `Monitor this topic regularly to catch any ranking drops early.`,
    );
  }

  const volume = estimateAiVolume(t);

  const summary = citedCount === 0
    ? `${b} is not currently cited by any AI model for "${t}" — significant visibility gap.`
    : citedCount === 3
    ? `${b} achieves full AI visibility across all 3 model styles for "${t}" with a share of voice of ${overallSov}/100.`
    : `${b} is cited by ${citedCount}/3 AI models for "${t}" with an overall share of voice of ${overallSov}/100.`;

  return {
    brand:  b,
    topic:  t,
    url,
    overallSov,
    citedCount,
    modelResults,
    topCompetitors,
    recommendations,
    aiVolumeLabel:    volume.label,
    aiVolumeEstimate: volume.estimate,
    summary,
  };
}
