import express from 'express';
import { findUserByApiKey, incrementUserUsage } from '../services/dbService';
import { rewriteDocumentForAI } from '../services/geminiService';
import { rewriteSignals } from '../services/rewriteSignals';
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
  // The weak spots the latest analysis found, so the rewrite targets them.
  const focus = Array.isArray(req.body?.focus)
    ? req.body.focus.filter((f: unknown): f is string => typeof f === 'string').map((f: string) => f.trim().slice(0, 300)).filter(Boolean).slice(0, 8)
    : [];

  if (!content || content.trim().length < 20) {
    return res.status(400).json({ error: 'bad_request', message: 'content is required (minimum 20 characters)' } as ApiError);
  }

  const module: 'general' | 'product_sellers' | 'developers' =
    mod === 'product_sellers' || mod === 'developers' ? mod : 'general';

  try {
    const result = await rewriteDocumentForAI(content, module, focus);
    const updatedUser = await incrementUserUsage(user.id);
    if (updatedUser) res.setHeader('X-Usage-Info', JSON.stringify(updatedUser.usage));
    return res.status(200).json({ success: true, ...result, signals: rewriteSignals(content, result.rewritten) });
  } catch (error) {
    const { status, body } = classifyGeminiError(error, 'rewrite');
    return res.status(status).json(body as ApiError);
  }
}
