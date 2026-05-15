// api/brand-visibility.ts — POST /api/brand-visibility  · GET /api/brand-visibility  · DELETE /api/brand-visibility
// Check how visible a brand is in AI-generated answers for a given topic.
import express from 'express';
import { findUserByApiKey, incrementUserUsage, saveBrandVisibilityCheck, getBrandVisibilityChecksByUser, deleteBrandVisibilityChecksByUser } from '../services/dbService';
import { runBrandVisibilityCheck } from '../services/brandVisibilityService';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

export default async function handler(req: express.Request, res: express.Response) {
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
  const businessPriceId = process.env.STRIPE_PRICE_ID_BUSINESS || 'price_1SeCJH3NMjs4uYdgpi0xB0XN';
  if (user.stripePriceId !== businessPriceId) {
    return res.status(403).json({ error: 'plan_required', message: 'AI Visibility requires a Business plan. Upgrade to unlock multi-model brand tracking.' } as ApiError);
  }
  if (user.usage.count >= user.usage.limit) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Monthly limit reached. Upgrade to continue.' } as ApiError);
  }

  const { brand, topic, url } = req.body as { brand?: string; topic?: string; url?: string };

  if (!brand || typeof brand !== 'string' || brand.trim().length < 2) {
    return res.status(400).json({ error: 'bad_request', message: 'brand is required (min 2 characters)' } as ApiError);
  }
  if (brand.length > 200) {
    return res.status(400).json({ error: 'bad_request', message: 'brand is too long (max 200 characters)' } as ApiError);
  }
  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({ error: 'bad_request', message: 'topic is required (min 3 characters)' } as ApiError);
  }
  if (topic.length > 300) {
    return res.status(400).json({ error: 'bad_request', message: 'topic is too long (max 300 characters)' } as ApiError);
  }

  let normalisedUrl: string | null = null;
  if (url && typeof url === 'string' && url.trim()) {
    let candidate = url.trim();
    if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;
    try {
      new URL(candidate);
      normalisedUrl = candidate;
    } catch {
      return res.status(400).json({ error: 'bad_request', message: 'url is malformed' } as ApiError);
    }
  }

  try {
    const result = await runBrandVisibilityCheck(brand.trim(), topic.trim(), normalisedUrl);

    // Persist to DB
    await saveBrandVisibilityCheck(user.id, {
      brand: result.brand,
      topic: result.topic,
      url: result.url,
      visibility_score: result.visibilityScore,
      mention_status: result.mentionStatus,
      mention_position: result.mentionPosition,
      sentiment: result.sentiment,
      sentiment_explanation: result.sentimentExplanation,
      answer_excerpt: result.answerExcerpt,
      sources: result.sources,
      competitors: result.competitors,
      recommendations: result.recommendations,
      summary: result.summary,
    });

    const updated = await incrementUserUsage(user.id);
    if (updated) res.setHeader('X-Usage-Info', JSON.stringify(updated.usage));

    return res.status(200).json({ success: true, data: result, ...result });
  } catch (error) {
    console.error('Brand visibility error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

/* ── GET /api/brand-visibility ─────────────────────────────────────────────────────────────────────────────────── */
export async function brandVisHistoryHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const items = await getBrandVisibilityChecksByUser(user.id, limit);
  return res.status(200).json({ success: true, data: items });
}

/* ── DELETE /api/brand-visibility ───────────────────────────────────────────────────────────────────────────────────────── */
export async function brandVisDeleteHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const count = await deleteBrandVisibilityChecksByUser(user.id);
  return res.status(200).json({ success: true, deleted: count });
}
