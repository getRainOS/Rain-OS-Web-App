// services/geminiService.ts — Rain OS AEO Scoring Engine v2.3
// 3-pillar scoring (general) + module-specific scoring (product_sellers, developers)
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
AuthorshipSignals,
} from '../types';
// ─── Config ───────────────────────────────────────────────────────────────────
// api_version is a single source of truth — never hardcoded in return statements
export const API_VERSION = '2.3';
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
let _client: GoogleGenerativeAI | null = null;
let _model: GenerativeModel | null = null;
function getModel(): GenerativeModel {



if (!_model) {
_client = new GoogleGenerativeAI(API_KEY);
_model = _client.getGenerativeModel({ model: MODEL });
}
return _model;
}
// ─── System instruction ───────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are an AEO (Answer Engine Optimization) and GEO
(Generative Engine Optimization) scoring engine.
You score content for how well it will be cited, quoted, and surfaced by AI
systems: ChatGPT, Perplexity, Google AI Overviews, Claude.
You will receive:
1. ALGORITHMIC PRE-ANALYSIS — hard metrics computed before you see the content.
Use these as scoring anchors. Do not contradict them.
2. The content itself.
3. The industry context.
Score across 4 pillars (0-100 each):
PILLAR 1 — AI READABILITY (weight: varies by module — 40% general, 20% product_sellers, 35% developers)
How well can AI systems parse, chunk, and extract answers from this content?
Sub-scores: structuralClarity, answerFirstFormatting, semanticPrecision,
contextSufficiency, sectionConceptIsolation
Anchors: use avgSentenceLength, longSentenceRatio, passiveVoiceRatio,
nestedClauseDepth, headingDensity, answerFirstRatio from pre-analysis.
PILLAR 2 — DIGITAL AUTHORITY (weight: varies by module — 30% general, 15% product_sellers, 35% developers)
Does the content signal expertise, trustworthiness, and citability to AI?
Sub-scores: citationSignals, entityClarity, topicalAuthority, freshnessSignals,
socialProofMarkup
Anchors: use entityDensity, definitionDensity from pre-analysis.
PILLAR 3 — CONVERSION READINESS (weight: varies by module — 30% general, 15% product_sellers, 30% developers)
Does the content guide the reader toward a clear next action?
Sub-scores: callToActionClarity, trustSignals, valueProposition, frictionReduction
Anchors: use qaDensity, answerFirstRatio from pre-analysis.
PILLAR 4 — PRODUCT DISCOVERABILITY (weight: varies by module — 0% general, 50% product_sellers, 0% developers)
For product/service content: how well will AI surface this in shopping or
discovery contexts?
Sub-scores: productVariantCoverage, merchantIdentityClarity, pricingTransparency,
availabilitySignals, comparativeContext
If content is not product-focused, score conservatively (40-60 range) based on
general discoverability signals.
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
productDiscoverability: 0 },
ai_readability_detail: { structuralClarity: 0, answerFirstFormatting: 0,
semanticPrecision: 0, contextSufficiency: 0, sectionConceptIsolation: 0 },
digital_authority_detail: { citationSignals: 0, entityClarity: 0,
topicalAuthority: 0, freshnessSignals: 0, socialProofMarkup: 0 },
conversion_readiness_detail: { callToActionClarity: 0, trustSignals: 0,
valueProposition: 0, frictionReduction: 0 },
product_discoverability_detail: { productVariantCoverage: 0,
merchantIdentityClarity: 0, pricingTransparency: 0, availabilitySignals: 0,
comparativeContext: 0 },
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
// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
// ─── Main export ──────────────────────────────────────────────────────────────
export async function analyzeContent(
content: string,
industry: string = 'General / Other',
module: 'general' | 'product_sellers' | 'developers' = 'general'
): Promise<AnalysisResponse> {
if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');
// Step 1: Algorithmic pre-analysis — hard metrics, no API cost
const metrics = computeReadabilityMetrics(content);
const groundingBlock = formatMetricsAsGroundingBlock(metrics);
// Step 2: Build the prompt with grounding anchors injected
// Build module-specific weight instruction
const moduleWeightInstructions = module === 'product_sellers'
  ? `MODULE: product_sellers
MODULE_WEIGHTS: AI Readability 20%, Digital Authority 15%, Conversion Readiness 15%, Product Discoverability 50%
For this module, Product Discoverability is the PRIMARY scoring focus. Score it with maximum precision — pricing transparency, variant coverage, availability, merchant identity, review signals, comparative context.`
  : module === 'developers'
  ? `MODULE: developers
MODULE_WEIGHTS: AI Readability (Documentation Structure) 35%, Digital Authority (Technical Completeness) 35%, Conversion Readiness (Technical Clarity) 30%, Product Discoverability 0% (not applicable)
For this module, score AI Readability as Documentation Structure (navigation, TOC, getting started), Digital Authority as Documentation Authority (API completeness, error coverage, versioning), and Conversion Readiness as Technical Clarity (code example quality, step determinism, snippet extractability). Do not score Product Discoverability — set to 0.`
  : `MODULE: general
MODULE_WEIGHTS: AI Readability 40%, Digital Authority 30%, Conversion Readiness 30%, Product Discoverability 0%
For this module, do not weight Product Discoverability in the overall score. Score it conservatively for WP plugin compatibility (40-60 range) but it does not affect the overall Rain Score.`;

const prompt = [
groundingBlock,
moduleWeightInstructions,
`INDUSTRY: ${industry}`,
'',
'=== CONTENT TO SCORE ===',
content.slice(0, 12000), // cap at ~12k chars to manage token cost
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
  ? { ar: 0.20, da: 0.15, cr: 0.15, pd: 0.50 }
  : module === 'developers'
  ? { ar: 0.35, da: 0.35, cr: 0.30, pd: 0.00 }
  : { ar: 0.40, da: 0.30, cr: 0.30, pd: 0.00 }; // general (Writers & Marketers)
const computedOverall = Math.round(
(p.aiReadability || 0) * moduleWeights.ar +
(p.digitalAuthority || 0) * moduleWeights.da +
(p.conversionReadiness || 0) * moduleWeights.cr +
(p.productDiscoverability || 0) * moduleWeights.pd
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
    
    ];
// Step 8: Build authorship — include legacy fields for WP plugin backward compatibility
const authorshipRaw = parsed.authorship || {};
const authorshipSignals: AuthorshipSignals = {
hasAuthorByline: Boolean(authorshipRaw.hasAuthorByline),
hasPublishDate: Boolean(authorshipRaw.hasPublishDate),
hasOrganization: Boolean(authorshipRaw.hasOrganization),
authorityScore: clamp(authorshipRaw.authorityScore || 0),
// Legacy fields — WP plugin reads these; keep until plugin is updated
hash: createHash('sha256').update(content.slice(0, 5000)).digest('hex'),
timestamp: new Date().toISOString(),
status: 'Analyzed',
};
return {
overallScore: clamp(parsed.overallScore || computedOverall),
pillarScores: parsed.pillarScores || {
aiReadability: 0, digitalAuthority: 0, conversionReadiness: 0,
productDiscoverability: 0 },
subScores,
phase2_sub_scores: parsed.phase2_sub_scores || ({} as Phase2SubScores),
ai_readability_detail: parsed.ai_readability_detail || ({} as AiReadabilityDetail),
digital_authority_detail: parsed.digital_authority_detail || ({} as DigitalAuthorityDetail),
conversion_readiness_detail: parsed.conversion_readiness_detail || ({} as ConversionReadinessDetail),
product_discoverability_detail: parsed.product_discoverability_detail || ({} as ProductDiscoverabilityDetail),
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
const raw = await callGeminiSimple(
content,
`You are a creative copywriter. Based on the provided content, generate 3-5 compelling and SEO-friendly titles. Respond ONLY with valid JSON: { "titles": ["string", ...] }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { titles: [] }; }
};
export const generateDescription = async (content: string): Promise<{ description:
string }> => {
const raw = await callGeminiSimple(
content,
`You are an expert SEO copywriter. Write a concise meta description of no more than 160 characters. Respond ONLY with valid JSON: { "description": "string" }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { description: '' }; }
};
export const summarizeContent = async (content: string): Promise<{ summary: string
}> => {
const raw = await callGeminiSimple(
content,
`You are an expert summarizer. Generate a concise summary that captures key points. Respond ONLY with valid JSON: { "summary": "string" }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { summary: '' }; }
};
export const rewriteSentence = async (sentence: string): Promise<{ rewritten:
string }> => {
const raw = await callGeminiSimple(
sentence,
`You are an expert editor. Rewrite the sentence for clarity and conciseness while preserving its meaning. Respond ONLY with valid JSON: { "rewritten": "string" }`
);
try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch {
return { rewritten: sentence }; }
};