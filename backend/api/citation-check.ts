// api/citation-check.ts — POST /api/citation-check
// Run a Google-grounded Gemini query to test whether a user's content would be
// cited by AI engines for a given topic. Counts as one usage credit.
import express from 'express';
import {
  findUserByApiKey,
  incrementUserUsage,
  saveCitationCheck,
  getCitationChecksByTopic,
  getCitationChecksByUser,
  deleteCitationCheck,
} from '../services/dbService';
import { runCitationCheck } from '../services/citationCheckService';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

export async function deleteHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const idRaw = req.params.id;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'bad_request', message: 'id must be a positive integer' } as ApiError);
  }

  try {
    const deleted = await deleteCitationCheck(user.id, id);
    if (!deleted) {
      return res.status(404).json({ error: 'not_found', message: 'Citation check not found' } as ApiError);
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Citation delete error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

export async function listHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const topic = typeof req.query.topic === 'string' ? req.query.topic : '';
  const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : NaN;
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : undefined;

  try {
    const items = topic && topic.trim().length >= 3
      ? await getCitationChecksByTopic(user.id, topic, limit ?? 20)
      : await getCitationChecksByUser(user.id, limit ?? 50);
    return res.status(200).json({ success: true, data: items, items });
  } catch (error) {
    console.error('Citation history error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

export default async function handler(req: express.Request, res: express.Response) {
  // ─── Auth & usage checks ────────────────────────────────────────────────
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

  // ─── Input validation ───────────────────────────────────────────────────
  const { topic, url } = req.body as { topic?: string; url?: string };
  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({
      error: 'bad_request',
      message: 'topic is required (min 3 characters)',
    } as ApiError);
  }
  if (topic.length > 500) {
    return res.status(400).json({
      error: 'bad_request',
      message: 'topic is too long (max 500 characters)',
    } as ApiError);
  }
  let normalisedUrl: string | null = null;
  if (url && typeof url === 'string' && url.trim()) {
    let candidate = url.trim();
    if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;
    try {
      new URL(candidate);
      normalisedUrl = candidate;
    } catch {
      return res.status(400).json({
        error: 'bad_request',
        message: 'url is malformed',
      } as ApiError);
    }
  }

  try {
    const result = await runCitationCheck(topic, normalisedUrl);

    // Persist to citation history (best-effort — never block the response on a save error)
    let history: any[] = [];
    try {
      await saveCitationCheck(user.id, {
        topic: result.topic,
        url: result.url,
        cited: result.cited,
        alignmentScore: result.alignmentScore,
        sources: result.sources,
        recommendations: result.recommendations,
        summary: result.summary,
      });
      history = await getCitationChecksByTopic(user.id, result.topic, 20);
    } catch (saveErr) {
      console.error('Citation save error:', saveErr);
    }

    // Increment usage (citation check = 1 credit)
    const updated = await incrementUserUsage(user.id);
    if (updated) res.setHeader('X-Usage-Info', JSON.stringify(updated.usage));

    return res.status(200).json({ success: true, data: result, history, ...result });
  } catch (error) {
    console.error('Citation check error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}
