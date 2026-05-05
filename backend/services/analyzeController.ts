// services/analyzeController.ts
// Route handlers for POST /api/analyze and GET /api/capabilities.
// Auth, usage-check, and incrementing all live here — keeping api/index.ts thin.
import express from 'express';
import { analyzeContent, API_VERSION } from './geminiService';
import { findUserByApiKey, incrementUserUsage, saveAnalysis } from './dbService';
import type { ApiError, CapabilitiesResponse, AnalysisResponse } from '../types';
const PHASE2_SUB_SCORES = [
'sectionConceptIsolation',
'instructionDeterminism',
'retrievalAnswerability',
'semanticRedundancyScore',
'socialProofMarkup',
'contentChunkingQuality',
'informationGainScore',
'citationReadiness',
'entityLinkability',
'topicalDepthScore',
'queryAlignmentScore',
'multimodalReadiness',
'productVariantCoverage',
'merchantIdentityClarity',
];
function getApiKey(req: express.Request): string | null {
const header = req.headers.authorization;
if (!header) return null;
return (Array.isArray(header) ? header[0] : header)?.split(' ')[1] || null;
}
export async function handleAnalyze(req: express.Request, res: express.Response) {
const apiKey = getApiKey(req);
if (!apiKey) {
return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
}
const user = await findUserByApiKey(apiKey);
if (!user) {
return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
}



if (user.subscriptionStatus !== 'active') {
return res.status(402).json({ error: 'payment_required', message: 'Active subscription required' } as ApiError);
}
if (user.usage.count >= user.usage.limit) {
return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Monthly limit reached. Upgrade to continue.' } as ApiError);
}
const { content, industry } = req.body as { content?: string; industry?: string
};
if (!content || typeof content !== 'string' || content.trim().length < 10) {
return res.status(400).json({ error: 'bad_request', message: 'content is required (minimum 10 characters)' } as ApiError);
}
try {
const result = await analyzeContent(content, industry || 'General / Other');
const updatedUser = await incrementUserUsage(user.id);
if (updatedUser) res.setHeader('X-Usage-Info',
JSON.stringify(updatedUser.usage));

// Persist to analysis history (best-effort — never block the response)
try {
  const typedResult = result as AnalysisResponse;
  const pillar = typedResult.pillarScores;
  await saveAnalysis(user.id, {
    overall_score: typeof typedResult.overallScore === 'number' ? typedResult.overallScore : null,
    ai_readability: typeof pillar?.aiReadability === 'number' ? pillar.aiReadability : null,
    digital_authority: typeof pillar?.digitalAuthority === 'number' ? pillar.digitalAuthority : null,
    conversion_readiness: typeof pillar?.conversionReadiness === 'number' ? pillar.conversionReadiness : null,
    product_discoverability: typeof pillar?.productDiscoverability === 'number' ? pillar.productDiscoverability : null,
    result_json: result,
  });
} catch (saveErr) {
  console.error('Analysis save error:', saveErr);
}

return res.status(200).json({ success: true, data: result, ...result });
} catch (error) {
console.error('Analysis error:', error);
const msg = error instanceof Error ? error.message : 'Analysis failed';
return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
}
}
export function handleCapabilities(_req: express.Request, res: express.Response) {
const capabilities: CapabilitiesResponse = {
api_version: API_VERSION,
pillars: ['aiReadability', 'digitalAuthority',
'conversionReadiness', 'productDiscoverability'],
phase2_sub_scores: PHASE2_SUB_SCORES,
scoring_model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};
return res.status(200).json(capabilities);
}