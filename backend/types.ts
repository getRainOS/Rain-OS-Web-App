// types.ts — Rain OS API v2.3
// 4-pillar scoring: AI Readability, Digital Authority, Conversion Readiness,Product Discoverability
// ─── Auth / User types ───────────────────────────────────────────────────────
// NOTE: Keep ALL fields here — dbService.mapRowToUser returns this full shape.
// analyzeController, url-scan, etc. only use the subset they need.
export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'inactive';
export interface User {
id: string;
email: string;
googleId?: string;
githubId?: string;
githubLogin?: string;
hashedPassword?: string;
passwordResetToken?: string;
passwordResetExpires?: Date;
apiKey: string;
hashedApiKey?: string;
stripeCustomerId?: string;
stripePriceId?: string;
subscriptionStatus: SubscriptionStatus;
usage: {
count: number;
limit: number;
resetDate?: string;
};
createdAt: Date;
}
export interface ApiError {
error: string;
message: string;
status?: number;
}
// ─── Core pillar scores ───────────────────────────────────────────────────────
export interface PillarScores {
aiReadability: number; // 0-100
digitalAuthority: number; // 0-100
conversionReadiness: number; // 0-100
productDiscoverability: number; // 0-100 — NEW in v2.3
}
// ─── Sub-scores ───────────────────────────────────────────────────────────────
export interface SubScore {
category: string;
score: number;
label: string;
insight?: string;
}
// ─── Phase 2 sub-scores (returned as flat object) ────────────────────────────
export interface Phase2SubScores {
// Pillar 1 — AI Readability
sectionConceptIsolation: number; // Each section covers exactly one idea
// Cross-pillar documentation quality
instructionDeterminism: number; // How unambiguous instructions/steps are
retrievalAnswerability: number; // How easily AI extracts a direct answer
semanticRedundancyScore: number; // Penalises repetitive content (inverted —lower is better, normalised)
// Pillar 2 — Digital Authority
socialProofMarkup: number; // Structured reviews, ratings, testimonials
// Pillar 4 — Product Discoverability
productVariantCoverage: number; // All product variants described
merchantIdentityClarity: number; // Brand/seller unambiguous to AI
// Existing phase2 signals carried forward
contentChunkingQuality: number;
informationGainScore: number;
citationReadiness: number;
entityLinkability: number;
topicalDepthScore: number;
queryAlignmentScore: number;
multimodalReadiness: number;
}

// ─── Pillar detail breakdowns ─────────────────────────────────────────────────
export interface AiReadabilityDetail {
  structuralClarity: number;
  answerFirstFormatting: number;
  semanticPrecision: number;
  contextSufficiency: number;
  sectionConceptIsolation: number;
  }
  export interface DigitalAuthorityDetail {
  citationSignals: number;
  entityClarity: number;
  topicalAuthority: number;
  freshnessSignals: number;
  socialProofMarkup: number;
  }
  export interface ConversionReadinessDetail {
  callToActionClarity: number;
  trustSignals: number;
  valueProposition: number;
  frictionReduction: number;
  }
  export interface ProductDiscoverabilityDetail {
  productVariantCoverage: number;
  merchantIdentityClarity: number;
  pricingTransparency: number;
  availabilitySignals: number;
  comparativeContext: number;
  }
  // ─── Authorship signals (v2.3) ────────────────────────────────────────────────
  export interface AuthorshipSignals {
  hasAuthorByline: boolean;
  hasPublishDate: boolean;
  hasOrganization: boolean;
  authorityScore: number;
  // Legacy fields preserved for backward compatibility with WP plugin
  hash?: string;
  timestamp?: string;
  status?: string;
  }
  // ─── Main analysis response (v2.3) ────────────────────────────────────────────
  export interface AnalysisResponse {
  overallScore: number;
  pillarScores: PillarScores;
  subScores: SubScore[];
  phase2_sub_scores: Phase2SubScores;
  ai_readability_detail: AiReadabilityDetail;
  digital_authority_detail: DigitalAuthorityDetail;
  conversion_readiness_detail: ConversionReadinessDetail;
  product_discoverability_detail: ProductDiscoverabilityDetail;
recommendations: string[];
keywords: string[];
authorship: AuthorshipSignals;
api_version: string;
}
// ─── Legacy alias — keeps geminiService/analyzeHandler callers compiling ──────
// Remove once all consumers are updated to AnalysisResponse.
export type AnalysisResult = AnalysisResponse;
// ─── Capabilities response ────────────────────────────────────────────────────
export interface CapabilitiesResponse {
api_version: string;
pillars: string[];
phase2_sub_scores: string[];
scoring_model: string;
}
// ─── Request types ────────────────────────────────────────────────────────────
export interface AnalyzeRequest {
content: string;
industry?: string;
action?: string;
}
export interface UrlScanRequest {
url: string;
industry?: string;
}
// ─── AI Readiness / plugin-facing types (unchanged) ──────────────────────────
export interface NormalizedChunk {
chunkId: string;
type: 'heading' | 'paragraph' | 'list' | 'table';
text: string;
wordCount: number;
headingLevel?: number;
index: number;
}
export interface RecommendationArtifact {
  type: 'json-ld' | 'llms-txt' | 'robots-txt' | 'html';
  content: string;
  filename?: string;
}

export interface AIRecommendation {
scope: 'chunk' | 'section' | 'document';
chunkId?: string;
sectionId?: string;
category: 'readability' | 'structure' | 'freshness' | 'citation' |'visibility';
severity: 'low' | 'medium' | 'high';
issue: string;
recommendation: string;
expectedImpact: number;
artifact?: RecommendationArtifact;
}

export interface NormalizationFingerprint {
  structureHash: string;
  outboundLinksHash: string;
  freshnessHash: string;
  }
  export interface AIReadinessScores {
  readability: number;
  structure: number;
  freshness: number;
  citation: number;
  visibility: number;
  }
