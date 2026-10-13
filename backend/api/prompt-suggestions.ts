// api/prompt-suggestions.ts — POST /api/prompt-suggestions
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { suggestPrompts, type SuggestionLane } from '../services/promptSuggestionService';
import { classifyGeminiError } from '../services/geminiErrors';
import type { ApiError } from '../types';

const LANES: SuggestionLane[] = ['general', 'product_sellers', 'developers', 'vibe_coders', 'local_business'];
const DAILY_LIMIT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

// Per-user rolling daily cap. In memory is enough: it only guards Gemini
// cost, and a restart resetting it early is harmless.
const usage = new Map<string, number[]>();

export function takeSlot(userId: string, now = Date.now()): boolean {
  const recent = (usage.get(userId) || []).filter(t => now - t < DAY_MS);
  if (recent.length >= DAILY_LIMIT) {
    usage.set(userId, recent);
    return false;
  }
  recent.push(now);
  usage.set(userId, recent);
  return true;
}

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);

  const { url, description, location, lane } = req.body as Record<string, unknown>;
  const clean = (v: unknown, max: number) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
  const u = clean(url, 300);
  const d = clean(description, 500);
  const l = clean(location, 120);
  if (!u && !d) {
    return res.status(400).json({ error: 'bad_request', message: 'Add your website or a short description of your business.' } as ApiError);
  }
  const laneValue: SuggestionLane = LANES.includes(lane as SuggestionLane) ? (lane as SuggestionLane) : 'general';

  if (!takeSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have generated suggestions 20 times today. Try again tomorrow.' } as ApiError);
  }

  try {
    const suggestions = await suggestPrompts({ url: u, description: d, location: l, lane: laneValue });
    if (!suggestions.length) {
      return res.status(502).json({ error: 'no_suggestions', message: 'Could not come up with questions this time. Try adding a short description.' } as ApiError);
    }
    return res.status(200).json({ success: true, suggestions });
  } catch (error) {
    const { status, body } = classifyGeminiError(error, 'prompt-suggestions');
    return res.status(status).json(body as ApiError);
  }
}
