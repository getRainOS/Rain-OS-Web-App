import express from 'express';
import { findUserByApiKey, incrementUserUsage, getAnalysisById } from '../services/dbService';
import { pillarRewrite, type Baseline } from '../services/pillarRewrite';
import { rememberScoredRewrite } from '../services/scoredRewrites';
import { getProductFacts, getStoreDefaults } from '../services/productFactService';
import { factsForPrompt, factsToSchema, verifiedFacts } from '../services/productFacts';
import { classifyGeminiError } from '../services/geminiErrors';
import type { ApiError } from '../types';

const getApiKey = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  return (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1] || null;
};

export default async function rewriteHandler(req: express.Request, res: express.Response) {
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
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Usage limit reached. Upgrade to continue.' } as ApiError);
  }

  const { content, module: mod } = req.body as { content?: string; module?: string };

  if (!content || content.trim().length < 20) {
    return res.status(400).json({ error: 'bad_request', message: 'content is required (minimum 20 characters)' } as ApiError);
  }

  const module = ['product_sellers', 'developers', 'local_business', 'vibe_coders'].includes(String(mod)) ? String(mod) : 'general';
  const industry = typeof req.body?.industry === 'string' ? req.body.industry.slice(0, 80) : undefined;
  const contentType = typeof req.body?.contentType === 'string' ? req.body.contentType.slice(0, 60) : undefined;

  // The piece's saved score is the "before"; without one it is scored now.
  let baseline: Baseline | null = null;
  const analysisId = Number(req.body?.analysisId);
  if (Number.isInteger(analysisId) && analysisId > 0) {
    const saved = await getAnalysisById(user.id, analysisId).catch(() => null);
    if (saved && typeof saved.overall_score === 'number') {
      baseline = {
        overallScore: saved.overall_score,
        pillarScores: {
          aiReadability: saved.ai_readability ?? 0, digitalAuthority: saved.digital_authority ?? 0,
          conversionReadiness: saved.conversion_readiness ?? 0, productDiscoverability: saved.product_discoverability ?? 0,
          localPresence: saved.local_presence ?? 0, ragReadiness: saved.rag_readiness ?? 0,
        },
        subScores: saved.subScores || [],
        recommendations: saved.recommendations || [],
      };
    }
  }

  // A product fact sheet: facts the rewrite may state as true.
  let facts = '';
  let productSchema: string | null = null;
  const productId = Number(req.body?.productId);
  if (Number.isInteger(productId) && productId > 0) {
    const sheet = await getProductFacts(user.id, productId).catch(() => null);
    if (sheet) {
      // Only confirmed facts plus store defaults; unconfirmed AI drafts are left out.
      const v = verifiedFacts(sheet.facts, await getStoreDefaults(user.id).catch(() => null));
      facts = factsForPrompt(v);
      productSchema = factsToSchema(v);
    }
  }

  try {
    // The fixes on screen ("Fix these for me"): rewritten against, then re-checked.
    const fixes = (Array.isArray(req.body?.fixes) ? req.body.fixes : []).slice(0, 30)
      .filter((f: any) => f && typeof f.id === 'string' && typeof f.text === 'string' && f.text.trim())
      .map((f: any) => ({
        id: String(f.id).slice(0, 80), text: String(f.text).slice(0, 600),
        pillar: typeof f.pillar === 'string' ? f.pillar : null,
        source: f.source === 'measured' ? 'measured' as const : 'judged' as const,
        metric: typeof f.metric === 'string' ? f.metric : undefined,
        sub: typeof f.sub === 'string' ? f.sub : undefined,
      }));
    const result = await pillarRewrite(content, module, { industry, contentType, baseline, facts, fixes });
    rememberScoredRewrite(user.id, result.rewritten, module, result.scored);
    const updatedUser = await incrementUserUsage(user.id);
    if (updatedUser) res.setHeader('X-Usage-Info', JSON.stringify(updatedUser.usage));
    const { scored, ...rest } = result;
    return res.status(200).json({ success: true, ...rest, productSchema });
  } catch (error) {
    const { status, body } = classifyGeminiError(error, 'rewrite');
    return res.status(status).json(body as ApiError);
  }
}
