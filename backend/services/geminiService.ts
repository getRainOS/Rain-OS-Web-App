import { generateContentWithRetry } from './geminiRetry';
// services/geminiService.ts — rain OS AEO Scoring Engine v2.4
// 5-pillar scoring (general) + module-specific scoring (product_sellers, developers, local_business)
// Algorithmic readability pre-analysis grounding.
// SDK: @google/generative-ai
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { contentTypeId, typeScorecardPrompt, applyTypeScorecard, measuredChecks, measuredFixes, coverageFixes, MEASURED_TOPICS } from './contentTypes';
import { computeReadabilityMetrics, formatMetricsAsGroundingBlock } from './readability'
import type {
AnalysisResponse,
Phase2SubScores,
SubScore,
AiReadabilityDetail,
DigitalAuthorityDetail,
ConversionReadinessDetail,
ProductDiscoverabilityDetail,
RagReadinessDetail,
LocalPresenceDetail,
AuthorshipSignals,
} from '../types';
// ─── Config ───────────────────────────────────────────────────────────────────
// api_version is a single source of truth — never hardcoded in return statements
export const API_VERSION = '2.6';
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
Score across 6 pillars (0-100 each — not every pillar applies to every module):
PILLAR 1 — AI READABILITY (weight: varies by module — 36% general, 20% product_sellers, 32% developers, 20% local_business)
How well can AI systems parse, chunk, and extract answers from this content?
Sub-scores: structuralClarity, answerFirstFormatting, semanticPrecision,
contextSufficiency, sectionConceptIsolation
Anchors: use avgSentenceLength, longSentenceRatio, passiveVoiceRatio,
nestedClauseDepth, headingDensity, answerFirstRatio from pre-analysis.
PILLAR 2 — DIGITAL AUTHORITY (weight: varies by module — 27% general, 15% product_sellers, 32% developers, 20% local_business)
Does the content signal expertise, trustworthiness, and citability to AI?
Sub-scores: citationSignals, entityClarity, topicalAuthority, freshnessSignals,
socialProofMarkup
Anchors: use entityDensity, definitionDensity from pre-analysis.
PILLAR 3 — CONVERSION READINESS (weight: varies by module — 27% general, 15% product_sellers, 26% developers, 20% local_business)
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

PILLAR 6 — LOCAL PRESENCE SIGNALS (weight: varies by module — 0% general, 0% product_sellers, 0% developers, 30% local_business)
For local service businesses: how well will AI trust and surface this
business's name, address, phone, service area, and reputation when a nearby
customer asks for a recommendation? This is distinct from Digital Authority —
it measures local findability and trust, not general expertise.
Sub-scores: napConsistency, localSchemaMarkup, serviceAreaClarity,
reviewSignalStrength, localCitationSignals
- napConsistency: Name, Address, Phone complete and consistent wherever it appears
- localSchemaMarkup: LocalBusiness schema — address, geo coordinates, hours, serviceArea
- serviceAreaClarity: City/neighborhood/service-radius explicitly stated
- reviewSignalStrength: Star ratings, review count, recency, business responses
- localCitationSignals: Third-party directory mentions, Google Business Profile link/embedded map, local press or community references
If content is not local-business-focused, score conservatively (40-60 range) based
on general local-relevance signals.
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
productDiscoverability: 0, ragReadiness: 0, localPresence: 0 },
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
local_presence_detail: { napConsistency: 0, localSchemaMarkup: 0,
serviceAreaClarity: 0, reviewSignalStrength: 0, localCitationSignals: 0 },
phase2_sub_scores: {
sectionConceptIsolation: 0, instructionDeterminism: 0, retrievalAnswerability:
0,
semanticRedundancyScore: 0, socialProofMarkup: 0, contentChunkingQuality: 0,
informationGainScore: 0, citationReadiness: 0, entityLinkability: 0,
topicalDepthScore: 0, queryAlignmentScore: 0, multimodalReadiness: 0,
productVariantCoverage: 0, merchantIdentityClarity: 0,
},
subScores: [],



recommendations: [{ pillar: '', text: '' }],
  summary: '',
keywords: [],
authorship: { hasAuthorByline: false, hasPublishDate: false, hasOrganization:
false, authorityScore: 0 },
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));
const VALID_PILLARS = new Set([
  'ai_readability', 'digital_authority', 'conversion_readiness',
  'product_discoverability', 'rag_readiness', 'local_presence',
]);
function normalizeRecommendations(raw: unknown): import('../types').PillarRecommendation[] {
  if (!Array.isArray(raw)) return [];
  const out: import('../types').PillarRecommendation[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      out.push({ pillar: null, text: item.trim(), source: 'judged', id: `j:${out.length}` });
    } else if (item && typeof item === 'object' && typeof (item as any).text === 'string' && (item as any).text.trim()) {
      const pillar = typeof (item as any).pillar === 'string' && VALID_PILLARS.has((item as any).pillar)
        ? (item as any).pillar as import('../types').PillarRecommendation['pillar']
        : null;
      const sub = typeof (item as any).sub === 'string' ? (item as any).sub.trim() : '';
      out.push({ pillar, text: (item as any).text.trim(), source: 'judged', id: `j:${sub || out.length}`, ...(sub ? { sub } : {}) });
    }
  }
  return out;
}
// ─── Content-type scoring rubrics ───────────────────────────────────────────
// Each type gets concrete, distinct structural/tonal expectations — not a
// generic "consider the type" hint — so the same draft is judged differently
// as a Social Post vs. a Landing Page vs. Documentation.
const CONTENT_TYPE_RUBRICS: Record<string, string> = {
  'article': `CONTENT TYPE: Article. Expect a clear headline, a scannable structure with descriptive subheadings, a logical narrative arc (intro -> body -> conclusion), and well-attributed claims or sources. Penalize walls of unbroken text and missing subheadings. Reward a strong, answer-first opening paragraph that works as a standalone AI citation.`,
  'blog post': `CONTENT TYPE: Blog Post. Expect a conversational but structured voice, short paragraphs, a clear takeaway or point of view, and scannable subheadings or a listicle structure where appropriate. Penalize corporate/stiff phrasing and missing a clear hook in the first two sentences. Reward concrete examples and a distinct author point of view.`,
  'product description': `CONTENT TYPE: Product Description. Expect pricing, availability, and key specs stated as direct, extractable facts (not buried in prose), a clear description of who the product is for, and concrete differentiators vs. alternatives. Penalize vague marketing adjectives with no supporting facts ("premium quality", "amazing") and missing specs. Reward bullet-style spec clarity and explicit comparison points.`,
  'landing page': `CONTENT TYPE: Landing Page. Expect a single clear value proposition above the fold, a direct call to action, scannable benefit-oriented sections (not dense paragraphs), and concrete proof points (numbers, testimonials, specifics) over vague claims. Penalize missing or buried CTAs and generic "we help businesses grow" style copy with no specifics. Reward clarity on exactly who this is for and what happens when they click through.`,
  'documentation': `CONTENT TYPE: Documentation. Expect a clear navigational structure (headings/TOC), deterministic step-by-step instructions, complete and runnable code examples, and explicit coverage of error cases or edge cases. Penalize ambiguous steps, missing prerequisites, and code snippets that can't be copy-pasted as-is. Reward versioning/compatibility notes and explicit expected output for each step.`,
  'social post': `CONTENT TYPE: Social Post. Expect extreme brevity, a strong hook in the first line, a single clear idea (not multiple buried points), and a natural, platform-appropriate tone. Penalize long-form structure, buried CTAs, and corporate phrasing that reads like a press release. Reward a clear single takeaway that stands alone without needing surrounding context.`,
};

export function contentTypeRubric(contentType?: string): string | null {
  if (!contentType) return null;
  const rubric = CONTENT_TYPE_RUBRICS[contentType.trim().toLowerCase()];
  if (rubric) return rubric;
  // Unrecognized/custom type label — still give Gemini the signal, just without a canned rubric.
  return `CONTENT TYPE: ${contentType} — weigh structure, tone, and formatting expectations for this content type when judging AI Readability and Conversion Readiness.`;
}
// ─── Main export ──────────────────────────────────────────────────────────────
// The lane-specific part of the scoring rubric: pillar weights and what each
// pillar is judged on. Shared by the scorer and the rewrite, so a rewrite is
// written to exactly the standard it is scored against.
export function moduleRubric(module: string): string {
  return module === 'product_sellers'
  ? `MODULE: product_sellers
MODULE_WEIGHTS: AI Readability 20%, Digital Authority 15%, Conversion Readiness 15%, Product Discoverability 50%, Local Presence Signals 0%, RAG Readiness 10%
For this module, Product Discoverability is the PRIMARY scoring focus — AI shopping answers recommend products whose facts they can extract and compare. Score it with maximum precision:
PRODUCT DISCOVERABILITY:
- Identity: brand, exact product/model name, and an identifier (SKU, GTIN/UPC, MPN) stated plainly
- Specs as facts: materials, dimensions, weight, capacity, compatibility — numbers and units, not adjectives
- Variant coverage: every size/color/option listed, with its own price and stock where they differ
- Pricing transparency: exact price with currency, sale price and what it compares against; no "contact us" or "a certain amount"
- Availability and logistics: in stock or not, shipping time and cost, free-shipping threshold, return window and conditions
- Best-for fit: who the product is for and for which use cases, stated directly ("best for hot yoga and travel")
- Comparative context: how it differs from named alternatives or the previous model, with specifics
- Review signals: rating, review count, and quotable review lines
- Buyer FAQ: direct answers to the questions shoppers ask AI (care, sizing, durability, warranty)
- Merchant identity: who sells it, warranty and support contact
CONVERSION READINESS signals: a clear add-to-cart or buy action, price near the action, trust signals (warranty, secure checkout, returns).
Do not score Local Presence Signals — set to 0.`
  : module === 'developers'
  ? `MODULE: developers
MODULE_WEIGHTS: AI Readability (Documentation Structure) 32%, Digital Authority (Technical Completeness) 32%, Conversion Readiness (Technical Clarity) 26%, Product Discoverability 0% (not applicable), Local Presence Signals 0% (not applicable), RAG Readiness 10%
For this module, score AI Readability as Documentation Structure (navigation, TOC, getting started), Digital Authority as Documentation Authority (API completeness, error coverage, versioning), and Conversion Readiness as Technical Clarity (code example quality, step determinism, snippet extractability). Do not score Product Discoverability or Local Presence Signals — set both to 0.`
  : module === 'vibe_coders'
  ? `MODULE: vibe_coders
MODULE_WEIGHTS: AI Readability 32%, Digital Authority 32%, Conversion Readiness 26%, Product Discoverability 0%, Local Presence Signals 0%, RAG Readiness 10%
This is an app or product built with an AI builder (landing page, app copy, docs). Score AI Readability on whether AI can tell in one sentence what the app does and for whom; Digital Authority on the maker's credibility, real use cases, pricing and limits stated plainly, privacy and data handling; Conversion Readiness on a clear sign-up or try action and what happens next. Do not score Product Discoverability or Local Presence Signals — set both to 0.`
  : module === 'local_business'
  ? `MODULE: local_business
MODULE_WEIGHTS: AI Readability 20%, Digital Authority 20%, Conversion Readiness 20%, Product Discoverability 0%, Local Presence Signals 30%, RAG Readiness 10%
For this module, Local Presence Signals is the PRIMARY scoring focus — local businesses live or die on whether AI can find and trust their location, hours, and reputation. Score it with maximum precision:
LOCAL PRESENCE SIGNALS:
- NAP (Name, Address, Phone) consistency and completeness in page content
- LocalBusiness schema presence (name, address, phone, hours, geo coordinates, serviceArea)
- Service area / location clarity: city/neighborhood explicitly mentioned, service area or delivery radius clearly defined
- Review signal strength: star ratings, review count, recent review dates, business response presence
- Local citation signals: third-party directory mentions, Google Business Profile link/embedded map, local press, community references
AI READABILITY signals (score how well AI can extract answers):
- Business name, address, phone, and hours extractable as direct answers
- Services list with plain-language descriptions
- Service pricing transparency: clear price ranges or starting prices for each service
- Availability signals: booking links, appointment CTAs, "same day" or "emergency" availability
- FAQs answering common local customer questions
DIGITAL AUTHORITY signals (general credibility, distinct from local presence):
- Business profile completeness: owner name, years in business, staff descriptions, credentials/licenses
- Topical authority: depth of expertise shown on services offered
- Freshness signals: recently updated content, current promotions or seasonal information
CONVERSION READINESS signals:
- Phone number prominence and click-to-call markup
- Online booking or contact form accessibility
- Directions link / embedded map
- Trust signals: licenses, insurance, certifications, guarantees
Do not score Product Discoverability — set to 0.`
  : `MODULE: general
MODULE_WEIGHTS: AI Readability 36%, Digital Authority 27%, Conversion Readiness 27%, Product Discoverability 0%, Local Presence Signals 0%, RAG Readiness 10%
For this module, do not weight Product Discoverability or Local Presence Signals in the overall score. Score both conservatively (40-60 range) but neither affects the overall Rain Score.
RAG Readiness is scored at 10% weight and always included. It measures RAG-system retrieval quality.`;
}

export async function analyzeContent(
content: string,
industry: string = 'General / Other',
module: 'general' | 'product_sellers' | 'developers' | 'local_business' | 'vibe_coders' = 'general',
contentType?: string
): Promise<AnalysisResponse> {
if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');
// Step 1: Algorithmic pre-analysis — hard metrics, no API cost
const metrics = computeReadabilityMetrics(content);
const groundingBlock = formatMetricsAsGroundingBlock(metrics);
const typeId = contentTypeId(contentType);
const scorecard = typeScorecardPrompt(typeId);
// Step 2: Build the prompt with grounding anchors injected
const moduleWeightInstructions = moduleRubric(module);

const prompt = [
groundingBlock,
moduleWeightInstructions,
`INDUSTRY: ${industry}`,
...(contentTypeRubric(contentType) ? [contentTypeRubric(contentType) as string] : []),
...(scorecard ? [scorecard] : []),
'',
'=== CONTENT TO SCORE ===',
content.slice(0, 12000), // cap at ~12k chars to manage token cost
'=== END CONTENT ===',
'',
`IMPORTANT: The "recommendations" array must contain one specific, actionable fix for EVERY judged sub-score above that scored under 70, weakest first (e.g. "Add a bulleted FAQ answering the top 3 buyer questions" rather than generic advice like "improve clarity"). Skip anything about ${MEASURED_TOPICS}: those fixes are measured and added separately. Each recommendation must be an object { "pillar": "<key>", "sub": "<the sub-score key it fixes, e.g. callToActionClarity>", "text": "<fix>" }, where "pillar" is exactly one of: "ai_readability", "digital_authority", "conversion_readiness", "product_discoverability", "rag_readiness", "local_presence". If no judged sub-score is under 70, return the 1-3 changes that would raise the score most.`,
  'IMPORTANT: The "summary" field must be a concise 1-2 sentence overview of what this content is about and its overall AEO readiness, written in plain language for a non-technical reader.',
  'Return your scores as a single JSON object matching this exact shape (all fields required):',
JSON.stringify(RESPONSE_SCHEMA, null, 2),
].join('\n');
const model = getModel();
// Step 3: Call Gemini with system instruction
const result = await generateContentWithRetry(model, {
systemInstruction: SYSTEM_INSTRUCTION,
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: {
// Zero temperature plus a fixed seed: the same content should score the
// same on a rerun. Gemini-judged pillars (like RAG Readiness) otherwise
// drift by a few points between identical runs.
temperature: 0,
seed: 7,
// Root cause of the truncation (confirmed it happened even on short
// content, which ruled out "response too long for the schema"):
// gemini-2.5-flash has "thinking" enabled by default with a dynamic
// budget, and those internal reasoning tokens count against the same
// maxOutputTokens cap as the visible JSON response. thinkingBudget: 0
// disables thinking entirely for this call — it's a pure structured
// scoring task with no need for chain-of-thought, so this also cuts
// latency. Kept maxOutputTokens generous as a belt-and-suspenders
// safety margin for the schema itself (46+ numeric fields plus
// free-text recommendations/keywords arrays).
thinkingConfig: { thinkingBudget: 0 },
maxOutputTokens: 8192,
responseMimeType: 'application/json',
},
});
// Step 3.5: Detect truncation before attempting to parse — a MAX_TOKENS
// finish reason means the JSON is guaranteed incomplete, so failing fast
// here gives a much clearer signal than letting JSON.parse throw blind.
const finishReason = result.response.candidates?.[0]?.finishReason;
if (finishReason === 'MAX_TOKENS') {
console.error('Gemini scoring response truncated (MAX_TOKENS). Raw so far:', result.response.text().slice(0, 500));
throw new Error('Gemini scoring response was truncated (hit max output tokens). Try shorter content or retry.');
}
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
applyTypeScorecard(parsed, typeId);
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
  ? { ar: 0.20, da: 0.15, cr: 0.15, pd: 0.50, lp: 0.00, rr: 0.10 }
  : module === 'developers' || module === 'vibe_coders'
  ? { ar: 0.32, da: 0.32, cr: 0.26, pd: 0.00, lp: 0.00, rr: 0.10 }
  : module === 'local_business'
  ? { ar: 0.20, da: 0.20, cr: 0.20, pd: 0.00, lp: 0.30, rr: 0.10 }
  : { ar: 0.36, da: 0.27, cr: 0.27, pd: 0.00, lp: 0.00, rr: 0.10 }; // general (Writers & Marketers)
const computedOverall = Math.round(
(p.aiReadability || 0) * moduleWeights.ar +
(p.digitalAuthority || 0) * moduleWeights.da +
(p.conversionReadiness || 0) * moduleWeights.cr +
(p.productDiscoverability || 0) * moduleWeights.pd +
(p.localPresence || 0) * moduleWeights.lp +
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
    { category: 'localPresence', score:
    clamp(parsed.pillarScores?.localPresence || 0), label: 'Local Presence' },
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
// Step 8: Build authorship signals
const authorshipRaw = parsed.authorship || {};
const authorshipSignals: AuthorshipSignals = {
hasAuthorByline: Boolean(authorshipRaw.hasAuthorByline),
hasPublishDate: Boolean(authorshipRaw.hasPublishDate),
hasOrganization: Boolean(authorshipRaw.hasOrganization),
authorityScore: clamp(authorshipRaw.authorityScore || 0),
    };
    return {
      overallScore: clamp(parsed.overallScore || computedOverall),
      pillarScores: parsed.pillarScores || {
        aiReadability: 0, digitalAuthority: 0, conversionReadiness: 0,
        productDiscoverability: 0, ragReadiness: 0, localPresence: 0 },
      subScores,
      phase2_sub_scores: parsed.phase2_sub_scores || ({} as Phase2SubScores),
      ai_readability_detail: parsed.ai_readability_detail || ({} as AiReadabilityDetail),
      digital_authority_detail: parsed.digital_authority_detail || ({} as DigitalAuthorityDetail),
      conversion_readiness_detail: parsed.conversion_readiness_detail || ({} as ConversionReadinessDetail),
      product_discoverability_detail: parsed.product_discoverability_detail || ({} as ProductDiscoverabilityDetail),
      rag_readiness_detail: parsed.rag_readiness_detail || ({} as RagReadinessDetail),
      local_presence_detail: parsed.local_presence_detail || ({} as LocalPresenceDetail),
      readability_metrics: metrics,
      content_type: typeId,
      measured_checks: measuredChecks(metrics, content, typeId),
      recommendations: (() => {
        // Measured fixes, the scorer's fixes, then a template fix for any weak
        // sub-score the scorer skipped, so every weak sub-score has a fix.
        const judged = normalizeRecommendations(parsed.recommendations);
        const counted = ([['ai_readability', 'ar'], ['digital_authority', 'da'], ['conversion_readiness', 'cr'],
          ['product_discoverability', 'pd'], ['local_presence', 'lp'], ['rag_readiness', 'rr']] as const)
          .filter(([, w]) => (moduleWeights as any)[w] > 0).map(([k]) => k);
        return [...measuredFixes(metrics, content, typeId), ...judged, ...coverageFixes(parsed, judged, [...counted])];
      })(),
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      authorship: authorshipSignals,
      api_version: API_VERSION, // single source of truth, never hardcoded
    };
  }

// ─── Legacy action helpers (still called by api/analyze.ts) ──────────────────
// Used by the analyze API's quick-action helpers (generate_description, summarize_content, rewrite_sentence).
import { GoogleGenerativeAI as GGA } from '@google/generative-ai';
async function callGeminiSimple(prompt: string, systemInstruction: string):
Promise<string> {
if (!API_KEY) throw new Error('GEMINI_API_KEY not set');
const client = new GGA(API_KEY);
const model = client.getGenerativeModel({ model: MODEL });
const result = await generateContentWithRetry(model, {
systemInstruction,
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: {
temperature: 0.5,
// Same fix as the main scoring call (see analyzeContent): gemini-2.5-flash
// has "thinking" on by default, and those reasoning tokens count against
// the same maxOutputTokens cap as the visible JSON — without disabling it,
// a 512-token budget can be fully consumed by thinking before any output
// is produced, leaving `raw` empty and silently breaking every quick tool.
thinkingConfig: { thinkingBudget: 0 },
maxOutputTokens: 512,
responseMimeType: 'application/json',
},
});

return result.response.text();
}
function parseQuickToolJson<T>(raw: string, label: string, fallback: T): T {
try {
return JSON.parse(raw.replace(/```json|```/g, '').trim());
} catch {
console.error(`[quick-tool] ${label} failed to parse Gemini response:`, raw.slice(0, 300));
throw new Error(`${label} failed — the AI response could not be read. Please try again.`);
}
}
export const generateTitles = async (content: string): Promise<{ titles: string[] }> => {
const raw = await callGeminiSimple(
content,
`You are a creative copywriter. Based on the provided content, generate 3-5 compelling and SEO-friendly titles. Respond ONLY with valid JSON: { "titles": ["string", ...] }`
);
return parseQuickToolJson(raw, 'Suggest Titles', { titles: [] });
};
export const generateDescription = async (content: string): Promise<{ description:
string }> => {
const raw = await callGeminiSimple(
content,
`You are an expert SEO copywriter. Write a concise meta description of no more than 160 characters. Respond ONLY with valid JSON: { "description": "string" }`
);
return parseQuickToolJson(raw, 'Meta Description', { description: '' });
};
export const summarizeContent = async (content: string): Promise<{ summary: string
}> => {
const raw = await callGeminiSimple(
content,
`You are an expert summarizer. Generate a concise summary that captures key points. Respond ONLY with valid JSON: { "summary": "string" }`
);
return parseQuickToolJson(raw, 'Summarize', { summary: '' });
};
export const rewriteSentence = async (sentence: string): Promise<{ rewritten:
string }> => {
const raw = await callGeminiSimple(
sentence,
`You are an expert editor. Rewrite the sentence for clarity and conciseness while preserving its meaning. Respond ONLY with valid JSON: { "rewritten": "string" }`
);
return parseQuickToolJson(raw, 'Rewrite', { rewritten: sentence });
};

// ─── Document rewrite for AI readability ──────────────────────────────────────
async function rewriteChunkForAI(
  content: string,
  module: string = 'general',
  part?: { index: number; total: number },
  extraInstruction = '',
  focus: string[] = [],
  contentType?: string,
  facts = ''
): Promise<{ rewritten: string; changes: string[]; needsYou: NeedsYou[]; faq: Array<{ q: string; a: string }> }> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');

  const targets = [
    'Average sentence length 15-20 words; under 5% of sentences over 30 words',
    'Passive voice under 10% of sentences',
    'No ambiguous pronouns: name the subject instead of "it", "this", "they" at the start of a sentence',
    'Vague words (various, some, often, things, aspects) replaced with specific terms',
    'At least half of all sentences lead with the answer or the key fact',
    'A descriptive heading every 100-200 words; each section covers exactly one concept',
    'A 40-60 word direct-answer summary at the very top that answers the main question on its own',
  ].map(t => `- ${t}`).join('\n');

  const prompt = `You rewrite content so it scores as close to 100 as possible on rain OS's AI-visibility rubric. The rubric below is the exact standard the rewrite will be scored against afterwards. Treat every pillar and sub-score in it as a requirement.

=== SCORING RUBRIC (the standard) ===
${SYSTEM_INSTRUCTION}

${moduleRubric(module)}
${contentTypeRubric(contentType) ?? ''}
=== END RUBRIC ===
${facts ? `\n${facts}\n` : ''}

MEASURED TARGETS (these are measured exactly in the rewritten text):
${targets}

RULES:
1. Meet every pillar of the rubric that can be met with the facts already in the content.
2. Preserve ALL facts, data, figures, examples, quotes and meaning. Never invent facts, numbers, reviews, credentials, prices, names or links.
3. ${isShortForm(contentType) ? 'This is a social post: keep it short. Lead with the hook, keep one idea, and cut it to under 1,300 characters (under 280 is ideal). No headings.' : 'Keep the full length: this is a rewrite, not a summary. Splitting sentences and adding headings usually makes it slightly longer.'}
4. Use Markdown: # and ## headings, - lists, numbered steps.
5. Where the rubric needs something only the owner can supply (real reviews, credentials, prices, original data, author bio, address, booking link, schema code on the page), do not make it up. List it in "needsYou" instead.

${focus.length ? `THIS CONTENT'S LATEST SCORE FOUND THESE WEAKNESSES. Fix each one specifically:\n${focus.map(f => `- ${f}`).join('\n')}\n\n` : ''}${extraInstruction ? `IMPORTANT: ${extraInstruction}\n\n` : ''}${part && part.total > 1 ? `This is part ${part.index} of ${part.total} of a longer document. Rewrite only this part. ${part.index === 1 ? 'Include the direct-answer summary at the top.' : 'Do not add a new introduction or summary.'} Keep heading levels consistent.\n\n` : ''}CONTENT TO REWRITE:
${content}

Respond with valid JSON only (no markdown fences):
{
  "rewritten": "the full rewritten content in Markdown, using \\n for line breaks",
  "changes": ["specific change 1", "..."] (4-8 concrete changes, each naming the pillar it improves),
  "needsYou": [{ "item": "what is missing", "why": "which pillar or sub-score it holds back and why", "where": "where in the piece it belongs" }] (empty if nothing),
  "faq": [{ "q": "a question a customer would ask AI", "a": "a 1-3 sentence answer using only facts from the content" }] (3-5 items${part && part.total > 1 && part.index !== part.total ? '; return [] for this part' : ''})
}

`;

  const model = getModel();
  const result = await generateContentWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      // Same cause as the scoring and Improve a Question failures: gemini-2.5-flash
      // "thinks" by default and those tokens share maxOutputTokens, so a full
      // article rewrite (thousands of tokens) got cut off mid-JSON. Thinking off,
      // and room for ~10,000 characters of rewritten text plus the change list.
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
    },
  });

  if (result.response.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
    console.error('Rewrite response truncated (MAX_TOKENS).');
    throw new Error('The rewrite was too long to finish. Try rewriting a shorter section.');
  }
  const raw = result.response.text();
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
    return {
      rewritten: typeof parsed.rewritten === 'string' ? parsed.rewritten : '',
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      needsYou: (Array.isArray(parsed.needsYou) ? parsed.needsYou : [])
        .map((n: any) => ({ item: str(n?.item), why: str(n?.why), where: str(n?.where) }))
        .filter((n: NeedsYou) => n.item),
      faq: (Array.isArray(parsed.faq) ? parsed.faq : [])
        .map((f: any) => ({ q: str(f?.q), a: str(f?.a) }))
        .filter((f: { q: string; a: string }) => f.q && f.a),
    };
  } catch (e) {
    console.error('Rewrite parse error:', raw.slice(0, 500));
    throw new Error('Failed to parse rewrite response');
  }
}

// Long documents are rewritten in parts (split on paragraph breaks) and
// stitched back together, so the whole piece is rewritten instead of only the
// first few thousand characters. One credit covers the whole rewrite.
const REWRITE_CHUNK_CHARS = 7000;
export const REWRITE_MAX_CHARS = 24000;
export const MIN_REWRITE_RATIO = 0.8;
// Social posts should get shorter, so the keep-the-length rule doesn't apply.
export const isShortForm = (contentType?: string) => /social/i.test(contentType || '');

// Something the rubric needs that only the owner can supply.
export interface NeedsYou { item: string; why: string; where: string }
export const wordCount = (t: string) => (t.match(/\S+/g) || []).length;

export function splitForRewrite(content: string, chunkChars = REWRITE_CHUNK_CHARS): string[] {
  const paragraphs = content.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    // A single paragraph longer than the limit is cut on a sentence boundary.
    const pieces = p.length > chunkChars ? (p.match(/[^.!?]+[.!?]*\s*/g) || [p]) : [p];
    for (const piece of pieces) {
      if (current && current.length + piece.length + 2 > chunkChars) {
        chunks.push(current.trim());
        current = '';
      }
      current += (current ? '\n\n' : '') + piece;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function rewriteDocumentForAI(
  content: string,
  module: string = 'general',
  focus: string[] = [],
  contentType?: string,
  facts = ''
): Promise<{ rewritten: string; changes: string[]; truncated: boolean; needsYou: NeedsYou[]; faq: Array<{ q: string; a: string }> }> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');
  const truncated = content.length > REWRITE_MAX_CHARS;
  const chunks = splitForRewrite(content.slice(0, REWRITE_MAX_CHARS));
  const parts = await Promise.all(
    chunks.map(async (c, i) => {
      const part = { index: i + 1, total: chunks.length };
      const first = await rewriteChunkForAI(c, module, part, '', focus, contentType, facts);
      // Models tend to condense. A rewrite that lost a fifth of the words has
      // almost certainly dropped content, so ask once more, firmly, and keep
      // whichever version is longer.
      const ratio = wordCount(first.rewritten) / Math.max(1, wordCount(c));
      if (ratio >= MIN_REWRITE_RATIO || isShortForm(contentType)) return first;
      const second = await rewriteChunkForAI(c, module, part,
        `Your previous rewrite was only ${Math.round(ratio * 100)}% of the original length and dropped content. Rewrite again and keep every point, example and detail.`, focus, contentType, facts)
        .catch(() => first);
      return wordCount(second.rewritten) > wordCount(first.rewritten) ? second : first;
    })
  );
  const changes = Array.from(new Set(parts.flatMap(p => p.changes))).slice(0, 10);
  const seen = new Set<string>();
  const needsYou = parts.flatMap(p => p.needsYou || []).filter(n => {
    const k = n.item.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 10);
  const faq = parts.flatMap(p => p.faq || []).slice(0, 6);
  return { rewritten: parts.map(p => p.rewritten.trim()).join('\n\n'), changes, truncated, needsYou, faq };
}

// Drafts the judgement fields of a product fact sheet (best for, specs...)
// from the product's own description only. Fields the description doesn't
// support come back empty — no invented specs or competitors. The owner
// confirms each draft before it is treated as a verified fact.
export async function draftProductFacts(input: { name: string; brand: string; sourceText: string }): Promise<Record<string, string>> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set');
  const prompt = `From this product's own description, draft short fact-sheet fields for AI shopping answers.

Product: ${input.name}${input.brand ? ` by ${input.brand}` : ''}
DESCRIPTION:
${input.sourceText.slice(0, 4000)}

Rules:
- Use only what the description states or directly implies. If it doesn't say, return "" for that field.
- Never invent measurements, materials, competitors or claims.
- "comparedTo" only if the description itself compares to named alternatives or a previous model; otherwise "".
- Plain, factual, under 25 words per field.

Respond with valid JSON only:
{ "bestFor": "", "notFor": "", "comparedTo": "", "materials": "", "dimensions": "", "weight": "", "specs": "" }`;
  const result = await generateContentWithRetry(getModel(), {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0, thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 1024, responseMimeType: 'application/json' } as any,
  });
  try {
    const parsed = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    const out: Record<string, string> = {};
    for (const k of ['bestFor', 'notFor', 'comparedTo', 'materials', 'dimensions', 'weight', 'specs']) {
      if (typeof parsed?.[k] === 'string' && parsed[k].trim()) out[k] = parsed[k].trim().slice(0, 400);
    }
    return out;
  } catch {
    throw new Error('Failed to parse product draft');
  }
}
