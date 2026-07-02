// services/geminiService.ts — Rain OS AEO Scoring Engine v2.4
// 5-pillar scoring (general) + module-specific scoring (product_sellers, developers, local_business)
// Algorithmic readability pre-analysis grounding.
// SDK: @google/generative-ai
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { computeReadabilityMetrics, formatMetricsAsGroundingBlock } from './readability'
import { createHash } from 'crypto';
import type {
AnalysisResponse,
Phase2SubScores,
SubScore,
AiReadabilityDetail,
DigitalAuthorityDetail,
ConversionReadinessDetail,
ProductDiscoverabilityDetail,
RagReadinessDetail,
AuthorshipSignals,
} from '../types';
// ─── Config ────────────────────────────────────────────────────────────[...]
// api_version is a single source of truth — never hardcoded in return statements
export const API_VERSION = '2.4';
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// ─── Content Truncation Constant ───────────────────────────────────────
const MAX_CONTENT_LENGTH = 12000; // Maximum characters to send to Gemini
const READABILITY_CONTENT_LENGTH = 10000; // For readability analysis

let _client: GoogleGenerativeAI | null = null;
let _model: GenerativeModel | null = null;
function getModel(): GenerativeModel {
if (!_model) {
_client = new GoogleGenerativeAI(API_KEY);
_model = _client.getGenerativeModel({ model: MODEL });
}
return _model;
}
// ─── System instruction ────────────────────────────────────────────────────────[...]
const SYSTEM_INSTRUCTION = `You are an AEO (Answer Engine Optimization) and GEO
(Generative Engine Optimization) scoring engine.
You score content for how well it will be cited, quoted, and surfaced by AI
systems: ChatGPT, Perplexity, Google AI Overviews, Claude.
You will receive:
1. ALGORITHMIC PRE-ANALYSIS — hard metrics computed before you see the content.
Use these as scoring anchors. Do not contradict them.
2. The content itself.
3. The industry context.
Score across 5 pillars (0-100 each):
PILLAR 1 — AI READABILITY (weight: varies by module — 36% general, 20% product_sellers, 32% developers, 27% local_business)
How well can AI systems parse, chunk, and extract answers from this content?
Sub-scores: structuralClarity, answerFirstFormatting, semanticPrecision,
contextSufficiency, sectionConceptIsolation
Anchors: use avgSentenceLength, longSentenceRatio, passiveVoiceRatio,
nestedClauseDepth, headingDensity, answerFirstRatio from pre-analysis.
PILLAR 2 — DIGITAL AUTHORITY (weight: varies by module — 27% general, 15% product_sellers, 32% developers, 36% local_business)
Does the content signal expertise, trustworthiness, and citability to AI?
Sub-scores: citationSignals, entityClarity, topicalAuthority, freshnessSignals,
socialProofMarkup
Anchors: use entityDensity, definitionDensity from pre-analysis.
PILLAR 3 — CONVERSION READINESS (weight: varies by module — 27% general, 15% product_sellers, 26% developers, 27% local_business)
Does the content guide the reader toward a clear next action?
Sub-scores: callToActionClarity, trustSignals, valueProposition, frictionReduction
Anchors: use qaDensity, answerFirstRatio from pre-analysis.
PILLAR 4 — PRODUCT DISCOVERABILITY (weight: varies by module — 0% general, 50% product_sellers, 0% developers, 0% local_business)
For product/service content: how well will AI surface this in shopping or
discovery contexts?
Sub-scores: productVariantCoverage, merchantIdentityClarity, pricingTransparency,
availabilitySignals, comparativeContext
If content is not product-focused, score conservatively (40-60 range) based on
general discoverability signals.

PILLAR 5 — RAG READINESS (weight: 10% all modules)
How well is this content optimized for Retrieval-Augmented Generation (RAG)
systems — vector databases, embedding models, and chunk-based retrieval?
This is distinct from citation scoring. RAG readiness measures whether an AI
retrieval system can accurately find, chunk, and synthesize your content.
Sub-scores: informationDensity, semanticMapping, narrativeNuance,
hierarchicalFormatting, explicitQaStructures, authoritySignals
Anchors: use sectionConceptIsolation, informationGainScore, queryAlignmentScore,
contentChunkingQuality from pre-analysis.
- informationDensity: Deep, exhaustive coverage with high information density per chunk
- semanticMapping: Rich vocabulary, synonyms, historical context, entity relationships
- narrativeNuance: Multi-layered explanations, "why" and "how" reasoning, edge cases
- hierarchicalFormatting: Clean markdown, logical header structure, descriptive titles
- explicitQaStructures: FAQ sections, direct definitions, problem-solution frameworks
- authoritySignals: External links to reputable sources, author bios, verifiable data
PHASE 2 ADDITIONAL SIGNALS (score each 0-100):
- sectionConceptIsolation: Does each section cover exactly one concept? AI
chunking quality.
- instructionDeterminism: How unambiguous are any instructions or steps? (0 if no
instructions present = 50 neutral)
- retrievalAnswerability: How easily can an AI extract a specific answer? Use
qaDensity and answerFirstRatio as anchors.
- semanticRedundancyScore: How much redundant/repetitive content? LOWER is better.
Return the raw redundancy level 0-100 (0=no redundancy, 100=highly repetitive).



The API will invert this.
- socialProofMarkup: Evidence of reviews, ratings, testimonials, case studies.
- contentChunkingQuality: How well does the content divide into discrete, self-
contained chunks for RAG retrieval?
- informationGainScore: Does this content add new information vs what AI already
knows?
- citationReadiness: How quotable/citable are individual sentences?
- entityLinkability: Are entities (people, places, products) clearly identified
and linkable?
- topicalDepthScore: Depth of coverage within the topic — breadth vs depth
balance.
- queryAlignmentScore: How well does this match likely user queries AI would
receive?
- multimodalReadiness: Are images, tables, structured elements described in text
for AI that cannot see them?
- productVariantCoverage: Coverage of product options, sizes, configurations.
- merchantIdentityClarity: How clearly is the brand/seller identified?
SCORING RULES:
- Use the algorithmic pre-analysis as hard constraints. If passiveVoiceRatio >
0.3, AI Readability cannot exceed 75.
- If longSentenceRatio > 0.2, structural clarity sub-score is penalised
proportionally.
- If answerFirstRatio > 0.5, reward answerFirstFormatting generously.
- If coreferenceLeakCount > 10, penalise semanticPrecision.
- Overall score = weighted average of pillars. The MODULE_WEIGHTS instruction above defines the exact weights. Use them precisely.
- Be calibrated: most real-world content scores 45-72. Reserve 85+ for exceptional
content.
- Do not give round numbers (avoid 50, 60, 70 exactly) — scores should reflect
genuine measurement.
OUTPUT FORMAT: Respond with valid JSON only. No markdown fences, no preamble, no
explanation.
`;
// ─── Response schema template (shape hint for Gemini) ────────────────────────
const RESPONSE_SCHEMA = {
overallScore: 0,
pillarScores: { aiReadability: 0, digitalAuthority: 0, conversionReadiness: 0,
productDiscoverability: 0, ragReadiness: 0 },
ai_readability_detail: { structuralClarity: 0, answerFirstFormatting: 0,
semanticPrecision: 0, contextSufficiency: 0, sectionConceptIsolation: 0 },
digital_authority_detail: { citationSignals: 0, entityClarity: 0,
topicalAuthority: 0, freshnessSignals: 0, socialProofMarkup: 0 },
conversion_readiness_detail: { callToActionClarity: 0, trustSignals: 0,
valueProposition: 0, frictionReduction: 0 },
product_discoverability_detail: { productVariantCoverage: 0,
merchantIdentityClarity: 0, pricingTransparency: 0, availabilitySignals: 0,
comparativeContext: 0 },
rag_readiness_detail: { informationDensity: 0, semanticMapping: 0,
narrativeNuance: 0, hierarchicalFormatting: 0, explicitQaStructures: 0,
authoritySignals: 0 },
phase2_sub_scores: {
sectionConceptIsolation: 0, instructionDeterminism: 0, retrievalAnswerability:
0,
semanticRedundancyScore: 0, socialProofMarkup: 0, contentChunkingQuality: 0,
informationGainScore: 0, citationReadiness: 0, entityLinkability: 0,
topicalDepthScore: 0, queryAlignmentScore: 0, multimodalReadiness: 0,
productVariantCoverage: 0, merchantIdentityClarity: 0,
},
subScores: [],
recommendations: [],
keywords: [],
authorship: { hasAuthorByline: false, hasPublishDate: false, hasOrganization:
false, authorityScore: 0 },
};
// ─── Helpers ──────────────────────────────────────────────────────────[...]
const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

// ─── UPFRONT CONTENT TRUNCATION ────────────────────────────────────────────────
// Truncate content at service entry point to avoid OOM bloat.
// This is called FIRST before any analysis is performed.
const truncateContentUpfront = (content: string, maxLength: number = MAX_CONTENT_LENGTH): string => {
  if (!content) return '';
  return content.length > maxLength ? content.slice(0, maxLength) : content;
};

// ─── Main export ──────────────────────────────────────────────────────────[...]
export async function analyzeContent(
content: string,
industry: string = 'General / Other',
module: 'general' | 'product_sellers' | 'developers' | 'local_business' = 'general'
): Promise<AnalysisResponse> {
if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');

// STEP 0: Upfront content truncation — prevent OOM bloat
const truncatedContent = truncateContentUpfront(content);

// Step 1: Algorithmic pre-analysis — hard metrics, no API cost
const metrics = computeReadabilityMetrics(truncatedContent);
const groundingBlock = formatMetricsAsGroundingBlock(metrics);
// Step 2: Build the prompt with grounding anchors injected
// Build module-specific weight instruction
const moduleWeightInstructions = module === 'product_sellers'
  ? `MODULE: product_sellers
MODULE_WEIGHTS: AI Readability 20%, Digital Authority 15%, Conversion Readiness 15%, Product Discoverability 50%, RAG Readiness 10%
For this module, Product Discoverability is the PRIMARY scoring focus. Score it with maximum precision — pricing transparency, variant coverage, availability, merchant identity, review signals,[...]
  : module === 'developers'
  ? `MODULE: developers
MODULE_WEIGHTS: AI Readability (Documentation Structure) 32%, Digital Authority (Technical Completeness) 32%, Conversion Readiness (Technical Clarity) 26%, Product Discoverability 0% (not applica[...]
For this module, score AI Readability as Documentation Structure (navigation, TOC, getting started), Digital Authority as Documentation Authority (API completeness, error coverage, versioning), a[...]
  : module === 'local_business'
  ? `MODULE: local_business
MODULE_WEIGHTS: AI Readability 27%, Digital Authority 36%, Conversion Readiness 27%, Product Discoverability 0%, RAG Readiness 10%
For this module, Digital Authority is the PRIMARY scoring focus — local businesses live or die on trust and findability signals. Score with maximum precision:
DIGITAL AUTHORITY signals:
- LocalBusiness schema presence (name, address, phone, hours, geo coordinates, serviceArea)
- NAP (Name, Address, Phone) consistency and completeness in page content
- Review signals: star ratings, review count, recent review dates, business response presence
- Local entity clarity: city/neighborhood explicitly mentioned, service area clearly defined
- Citation signals: third-party directory mentions, local press, community references
- Google Business Profile signals: link to GBP, embedded map, claimed/verified signals
- Business profile completeness: owner name, years in business, staff descriptions, credentials/licenses
AI READABILITY signals (score how well AI can extract answers):
- Business name, address, phone, and hours extractable as direct answers
- Services list with plain-language descriptions
- Service pricing transparency: clear price ranges or starting prices for each service (from product sellers module — pricing clarity drives AI citations)
- Availability signals: booking links, appointment CTAs, "same day" or "emergency" availability
- FAQs answering common local customer questions
CONVERSION READINESS signals:
- Phone number prominence and click-to-call markup
- Online booking or contact form accessibility
- Directions link / embedded map
- Service area or delivery radius clearly stated
- Trust signals: licenses, insurance, certifications, guarantees
Do not score Product Discoverability — set to 0.`
  : `MODULE: general
MODULE_WEIGHTS: AI Readability 36%, Digital Authority 27%, Conversion Readiness 27%, Product Discoverability 0%, RAG Readiness 10%
For this module, do not weight Product Discoverability in the overall score. Score it conservatively for WP plugin compatibility (40-60 range) but it does not affect the overall Rain Score.
RAG Readiness is scored at 10% weight and always included. It measures RAG-system retrieval quality.`;

const prompt = [
groundingBlock,
moduleWeightInstructions,
`INDUSTRY: ${industry}`,
'',
'=== CONTENT TO SCORE ===',
truncatedContent,
'=== END CONTENT ===',
'',
'Return your scores as a single JSON object matching this exact shape (all fields required):',
JSON.stringify(RESPONSE_SCHEMA, null, 2),
].join('\n');
const model = getModel();
// Step 3: Call Gemini with system instruction
const result = await model.generateContent({
systemInstruction: SYSTEM_INSTRUCTION,
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: {
temperature: 0.1, // low temp for consistent scoring
maxOutputTokens: 2048,
responseMimeType: 'application/json',
},
});
const raw = result.response.text();
// Step 4: Parse and validate
let parsed: any;
try {
const clean = raw.replace(/```json|```/g, '').trim();
parsed = JSON.parse(clean);
} catch (e) {
console.error('Gemini response parse error:', raw.slice(0, 500));
throw new Error('Failed to parse Gemini scoring response as JSON');
}
// Step 5: Invert semanticRedundancyScore with bounds clamp
// Gemini returns raw redundancy level (0=clean, 100=highly repetitive).
// We expose an improvement score (100=clean, 0=highly repetitive).
if (parsed.phase2_sub_scores?.semanticRedundancyScore !== undefined) {
const raw_redundancy =
clamp(parsed.phase2_sub_scores.semanticRedundancyScore);
parsed.phase2_sub_scores.semanticRedundancyScore = 100 - raw_redundancy;
}
// Step 6: Compute overall score from pillar weights
// Recompute and correct if Gemini's value is more than 10 points off
const p = parsed.pillarScores || {};
// Module-specific pillar weights
const moduleWeights = module === 'product_sellers'
  ? { ar: 0.20, da: 0.15, cr: 0.15, pd: 0.50, rr: 0.10 }
  : module === 'developers'
  ? { ar: 0.32, da: 0.32, cr: 0.26, pd: 0.00, rr: 0.10 }
  : module === 'local_business'
  ? { ar: 0.27, da: 0.36, cr: 0.27, pd: 0.00, rr: 0.10 }
  : { ar: 0.36, da: 0.27, cr: 0.27, pd: 0.00, rr: 0.10 }; // general (Writers & Marketers)
const computedOverall = Math.round(
(p.aiReadability || 0) * moduleWeights.ar +
(p.digitalAuthority || 0) * moduleWeights.da +
(p.conversionReadiness || 0) * moduleWeights.cr +
(p.productDiscoverability || 0) * moduleWeights.pd +
(p.ragReadiness || 0) * moduleWeights.rr
);
if (Math.abs((parsed.overallScore || 0) - computedOverall) > 10) {
parsed.overallScore = computedOverall;
}
// Step 7: Build normalised subScores array for backward compatibility
const subScores: SubScore[] = [
    { category: 'structuralClarity', score:
    clamp(parsed.ai_readability_detail?.structuralClarity || 0), label:
    'Structural Clarity' },
    { category: 'answerFirstFormatting', score:
    clamp(parsed.ai_readability_detail?.answerFirstFormatting || 0), label: 'Answer-First Formatting' },
    { category: 'semanticPrecision', score:
    clamp(parsed.ai_readability_detail?.semanticPrecision || 0), label: 'Semantic Precision' },
    { category: 'contextSufficiency', score:
    clamp(parsed.ai_readability_detail?.contextSufficiency || 0), label: 'Context Sufficiency' },
    { category: 'citationSignals', score:
    clamp(parsed.digital_authority_detail?.citationSignals || 0), label: 'Citation Signals' },
    { category: 'entityClarity', score:
    clamp(parsed.digital_authority_detail?.entityClarity || 0), label: 'Entity Clarity' },
    { category: 'topicalAuthority', score:
    clamp(parsed.digital_authority_detail?.topicalAuthority || 0), label: 'Topical Authority' },
    { category: 'freshnessSignals', score:
    clamp(parsed.digital_authority_detail?.freshnessSignals || 0), label: 'Freshness Signals' },
    { category: 'socialProofMarkup', score:
    clamp(parsed.digital_authority_detail?.socialProofMarkup || 0), label: 'Social Proof Markup' },
    { category: 'callToActionClarity', score:
    clamp(parsed.conversion_readiness_detail?.callToActionClarity || 0), label: 'CTA Clarity' },
    { category: 'valueProposition', score:
    clamp(parsed.conversion_readiness_detail?.valueProposition || 0), label: 'Value Proposition' },
    { category: 'productDiscoverability', score:
    clamp(parsed.pillarScores?.productDiscoverability || 0), label: 'Product Discoverability' },
    { category: 'ragReadiness', score:
    clamp(parsed.pillarScores?.ragReadiness || 0), label: 'RAG Readiness' },
    { category: 'informationDensity', score:
    clamp(parsed.rag_readiness_detail?.informationDensity || 0), label: 'Information Density' },
    { category: 'semanticMapping', score:
    clamp(parsed.rag_readiness_detail?.semanticMapping || 0), label: 'Semantic Mapping' },
    { category: 'narrativeNuance', score:
    clamp(parsed.rag_readiness_detail?.narrativeNuance || 0), label: 'Narrative Nuance' },
    { category: 'hierarchicalFormatting', score:
    clamp(parsed.rag_readiness_detail?.hierarchicalFormatting || 0), label: 'Hierarchical Formatting' },
    { category: 'explicitQaStructures', score:
    clamp(parsed.rag_readiness_detail?.explicitQaStructures || 0), label: 'Explicit Q&A Structures' },
    { category: 'authoritySignals', score:
    clamp(parsed.rag_readiness_detail?.authoritySignals || 0), label: 'Authority Signals' },
    ];
// Step 8: Build authorship — include legacy fields for WP plugin backward compatibility
const authorshipRaw = parsed.authorship || {};
const authorshipSignals: AuthorshipSignals = {
hasAuthorByline: Boolean(authorshipRaw.hasAuthorByline),
hasPublishDate: Boolean(authorshipRaw.hasPublishDate),
hasOrganization: Boolean(authorshipRaw.hasOrganization),
authorityScore: clamp(authorshipRaw.authorityScore || 0),
// Legacy fields — WP plugin reads these; keep until plugin is updated
hash: createHash('sha256').update(truncatedContent.slice(0, 5000)).digest('hex'),
timestamp: new Date().toISOString(),
status: 'Analyzed',
};
return {
overallScore: clamp(parsed.overallScore || computedOverall),
pillarScores: parsed.pillarScores || {
aiReadability: 0, digitalAuthority: 0, conversionReadiness: 0,
productDiscoverability: 0, ragReadiness: 0 },
subScores,
phase2_sub_scores: parsed.phase2_sub_scores || ({} as Phase2SubScores),
ai_readability_detail: parsed.ai_readability_detail || ({} as AiReadabilityDetail),
digital_authority_detail: parsed.digital_authority_detail || ({} as DigitalAuthorityDetail),
conversion_readiness_detail: parsed.conversion_readiness_detail || ({} as ConversionReadinessDetail),
product_discoverability_detail: parsed.product_discoverability_detail || ({} as ProductDiscoverabilityDetail),
rag_readiness_detail: parsed.rag_readiness_detail || ({} as RagReadinessDetail),
recommendations: Array.isArray(parsed.recommendations) ?
parsed.recommendations : [],
keywords: Array.isArray(parsed.keywords) ?
parsed.keywords : [],
authorship: authorshipSignals,
api_version: API_VERSION, // single source of truth — never hardcoded
};
}
// ─── Legacy action helpers (still called by api/analyze.ts) ──────────────────
// These remain so the existing WP plugin quick-actions keep working.
import { GoogleGenerativeAI as GGA } from '@google/generative-ai';
async function callGeminiSimple(prompt: string, systemInstruction: string):
Promise<string> {
if (!API_KEY) throw new Error('GEMINI_API_KEY not set');
const client = new GGA(API_KEY);
const model = client.getGenerativeModel({ model: MODEL });
const result = await model.generateContent({
systemInstruction,
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: { temperature: 0.5, maxOutputTokens: 512, responseMimeType:
'application/json' },
});
return result.response.text();
}
export const generateTitles = async (content: string): Promise<{ titles: string[] }> => {
const truncated = truncateContentUpfront(content);
const raw = await callGeminiSimple(
truncated,
`You are a creative copywriter. Based on the provided content, generate 3-5 compelling and SEO-friendly titles. Respond ONLY with valid JSON: { "titles": ["string", ...] }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { titles: [] }; }
};
export const generateDescription = async (content: string): Promise<{ description:
string }> => {
const truncated = truncateContentUpfront(content);
const raw = await callGeminiSimple(
truncated,
`You are an expert SEO copywriter. Write a concise meta description of no more than 160 characters. Respond ONLY with valid JSON: { "description": "string" }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { description: '' }; }
};
export const summarizeContent = async (content: string): Promise<{ summary: string
}> => {
const truncated = truncateContentUpfront(content);
const raw = await callGeminiSimple(
truncated,
`You are an expert summarizer. Generate a concise summary that captures key points. Respond ONLY with valid JSON: { "summary": "string" }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { summary: '' }; }
};
export const rewriteSentence = async (sentence: string): Promise<{ rewritten:
string }> => {
const truncated = truncateContentUpfront(sentence);
const raw = await callGeminiSimple(
truncated,
`You are an expert editor. Rewrite the sentence for clarity and conciseness while preserving its meaning. Respond ONLY with valid JSON: { "rewritten": "string" }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { rewritten: sentence }; }
};

// ─── Document rewrite for AI readability ──────────────────────────────────────
export async function rewriteDocumentForAI(
  content: string,
  module: 'general' | 'product_sellers' | 'developers' = 'general'
): Promise<{ rewritten: string; changes: string[] }> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');

  // STEP 0: Upfront truncation for rewrite content
  const truncatedContent = truncateContentUpfront(content, READABILITY_CONTENT_LENGTH);

  const moduleContext = module === 'developers'
    ? `This is technical documentation. Priorities: clear getting-started section, unambiguous numbered steps (copy-paste ready), code examples clearly framed with context, error scenarios covered[...]
    : module === 'product_sellers'
    ? `This is product content. Priorities: lead with the primary benefit, make pricing/variants/availability explicit, add comparison context, ensure strong purchase CTAs, use specific claims ov[...]
    : `This is content marketing or editorial content. Priorities: answer-first paragraphs, scannable headings, concise active sentences, strong CTA placement, citation-ready statements (clear su[...]

  const prompt = `You are an AEO (Answer Engine Optimization) expert rewriting content so AI systems (ChatGPT, Perplexity, Google AI Overviews, Claude) can better extract, quote, and cite it.

Context: ${moduleContext}

REWRITING RULES:
1. Answer-first: Lead every paragraph and section with the key fact or answer, then explain
2. Active voice: Convert passive constructions to active wherever natural
3. Descriptive headings: Use H2/H3 headings that could stand alone as question-answers
4. Short sentences: Keep sentences under 25 words where possible; split complex ones
5. Atomic sections: Each section covers exactly ONE concept (critical for AI chunking)
6. Remove vagueness: Replace words like "some", "often", "various" with specific terms
7. Preserve ALL facts, data, figures, and meaning — do not add new information or hallucinate
8. Instructions: Number all steps explicitly; make each step independently executable

CONTENT TO REWRITE:
${truncatedContent}

Respond with valid JSON only (no markdown fences):
{
  "rewritten": "the full rewritten content preserving markdown formatting, using \\n for line breaks",
  "changes": ["specific change 1", "specific change 2", "..."] (4-8 concrete changes made)
}`;

  const model = getModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const raw = result.response.text();
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      rewritten: typeof parsed.rewritten === 'string' ? parsed.rewritten : '',
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
    };
  } catch (e) {
    console.error('Rewrite parse error:', raw.slice(0, 500));
    throw new Error('Failed to parse rewrite response');
  }
}
