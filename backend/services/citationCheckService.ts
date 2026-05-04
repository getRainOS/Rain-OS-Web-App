// services/citationCheckService.ts — Rain OS AI Citation Monitor
// Uses Gemini with Google Search grounding to test whether a user's content
// would be cited by AI engines when answering a given topic/question.
// SDK: @google/generative-ai (googleSearch tool)
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
  alignmentScore: number;
  sources: CitationSource[];
  competitorDomains: string[];
  recommendations: string[];
  summary: string;
  answerExcerpt: string;
}

function extractDomain(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
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
  // We use the googleSearch tool so Gemini retrieves and cites real sources.
  const groundedModel = client.getGenerativeModel({
    model: MODEL,
    tools: [{ googleSearch: {} } as any],
  } as any);

  const groundedPrompt =
    `A user is asking an AI assistant the following question. ` +
    `Answer it as you would for them, citing the most authoritative current sources from the web.\n\n` +
    `QUESTION: ${trimmedTopic}\n\n` +
    `Provide a concise, factual answer (2-4 short paragraphs). Cite sources naturally.`;

  const groundedResult = await groundedModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: groundedPrompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  } as any);

  const answerText = groundedResult.response.text();
  const candidate: any = groundedResult.response.candidates?.[0] || {};
  const groundingMetadata: any = candidate.groundingMetadata || {};
  const chunks: any[] = groundingMetadata.groundingChunks || [];
  const supports: any[] = groundingMetadata.groundingSupports || [];

  // ─── Build the sources list from grounding chunks ─────────────────────────
  const seen = new Set<string>();
  const sources: CitationSource[] = [];
  for (const chunk of chunks) {
    const web = chunk?.web || {};
    const rawUrl: string = web.uri || web.url || '';
    if (!rawUrl) continue;
    const domain = extractDomain(rawUrl);
    if (seen.has(rawUrl)) continue;
    seen.add(rawUrl);
    sources.push({
      title: web.title || domain || 'Untitled source',
      url: rawUrl,
      domain,
      snippet: '',
    });
  }

  // Attach snippets from groundingSupports text segments where possible
  for (const support of supports) {
    const indices: number[] = support?.groundingChunkIndices || [];
    const segmentText: string = support?.segment?.text || '';
    if (!segmentText) continue;
    for (const idx of indices) {
      if (sources[idx] && !sources[idx].snippet) {
        sources[idx].snippet = segmentText.slice(0, 240);
      }
    }
  }

  // Citation match against user's domain
  let citedSourceIndex: number | null = null;
  if (userDomain) {
    const idx = sources.findIndex(s => s.domain === userDomain || s.domain.endsWith('.' + userDomain) || userDomain.endsWith('.' + s.domain));
    if (idx >= 0) citedSourceIndex = idx;
  }
  const cited = citedSourceIndex !== null;

  const competitorDomains = sources
    .filter((_, i) => i !== citedSourceIndex)
    .map(s => s.domain);

  // ─── Step 2: Structured analysis call (no grounding, JSON only) ──────────
  // Ask Gemini to score alignment and produce recommendations.
  const analysisModel = client.getGenerativeModel({ model: MODEL });
  const analysisPrompt = [
    `You are an AEO (Answer Engine Optimization) strategist analysing whether a user's website would be cited by AI engines for a given query.`,
    ``,
    `USER QUERY: ${trimmedTopic}`,
    `USER WEBSITE: ${userUrl || '(not provided)'}`,
    `USER DOMAIN: ${userDomain || '(none)'}`,
    `CURRENTLY CITED BY AI: ${cited ? 'YES — user domain appears in sources' : 'NO — user domain not in cited sources'}`,
    ``,
    `SOURCES AI ACTUALLY CITED FOR THIS QUERY:`,
    sources.length === 0
      ? '(No grounded sources returned)'
      : sources.map((s, i) => `${i + 1}. ${s.title} — ${s.domain}${s.snippet ? `\n   "${s.snippet.slice(0, 160)}"` : ''}`).join('\n'),
    ``,
    `AI ANSWER GIVEN TO USER QUERY:`,
    answerText.slice(0, 1500),
    ``,
    `Return a single JSON object with this exact shape:`,
    `{`,
    `  "alignmentScore": 0,         // 0-100 — how well the user's site (if provided) is aligned with what AI cites, OR (if no URL) how strong the citation field is overall`,
    `  "summary": "string",         // ONE sentence explaining the citation situation in plain English`,
    `  "recommendations": ["string", "string", "string"]   // 3-4 specific, actionable AEO improvements`,
    `}`,
    ``,
    `Rules:`,
    `- If the user's domain IS cited, score 70-95 and recommend protecting/extending the position.`,
    `- If NOT cited but the domain is reasonable for the topic, score 30-60 and give specific gap-closing recommendations referencing the actual cited competitors.`,
    `- If no URL was provided, score the citation field's competitiveness (how dominated it is, how fresh the sources are) and recommendations should be generic AEO best practices for the topic.`,
    `- Recommendations must be concrete (mention schema markup, content structure, citation patterns, freshness, etc.) — no vague advice.`,
    `- Respond with valid JSON only. No markdown fences, no preamble.`,
  ].join('\n');

  const analysisResult = await analysisModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 768,
      responseMimeType: 'application/json',
    },
  });

  const rawAnalysis = analysisResult.response.text();
  let analysis: any = {};
  try {
    analysis = JSON.parse(rawAnalysis.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error('Citation analysis parse error:', rawAnalysis.slice(0, 400));
    analysis = {
      alignmentScore: cited ? 75 : 40,
      summary: cited
        ? `Your site appears among the sources AI cites for "${trimmedTopic}".`
        : `Your site does not currently appear in AI citations for "${trimmedTopic}".`,
      recommendations: [
        'Improve answer-first formatting — lead each section with a direct one-sentence answer.',
        'Add citation-friendly structured data (Article + FAQPage schema).',
        'Build authoritative inbound links from sources AI already trusts on this topic.',
      ],
    };
  }

  return {
    topic: trimmedTopic,
    url: userUrl || null,
    cited,
    citedSourceIndex,
    alignmentScore: clamp(analysis.alignmentScore ?? (cited ? 75 : 40)),
    sources,
    competitorDomains: Array.from(new Set(competitorDomains)),
    recommendations: Array.isArray(analysis.recommendations)
      ? analysis.recommendations.slice(0, 4).map((r: any) => String(r))
      : [],
    summary: typeof analysis.summary === 'string' ? analysis.summary : '',
    answerExcerpt: answerText.slice(0, 600),
  };
}
