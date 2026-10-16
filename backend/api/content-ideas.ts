// api/content-ideas.ts — POST /api/content-ideas
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { suggestContentIdeas, type IdeaKind } from '../services/contentIdeasService';
import { createDailyLimiter } from '../services/dailyLimiter';
import { classifyGeminiError } from '../services/geminiErrors';
import type { ApiError } from '../types';

const takeSlot = createDailyLimiter(20);
const KINDS: IdeaKind[] = ['blog', 'article', 'any'];

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);

  const { topic, writing, kind, audience } = req.body as Record<string, unknown>;
  const clean = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
  const t = clean(topic, 300);
  const w = clean(writing, 20000);
  if (!t && (!w || w.length < 80)) {
    return res.status(400).json({ error: 'bad_request', message: 'Add a topic, or paste something you wrote (at least a few sentences).' } as ApiError);
  }
  const k: IdeaKind = KINDS.includes(kind as IdeaKind) ? (kind as IdeaKind) : 'any';

  if (!takeSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have asked for ideas 20 times today. Try again tomorrow.' } as ApiError);
  }

  try {
    const ideas = await suggestContentIdeas({ topic: t, writing: w, kind: k, audience: clean(audience, 200) });
    if (!ideas.length) {
      return res.status(502).json({ error: 'no_ideas', message: 'Could not come up with ideas this time. Try adding a little more detail.' } as ApiError);
    }
    return res.status(200).json({ success: true, ideas });
  } catch (error) {
    const { status, body } = classifyGeminiError(error, 'content-ideas');
    return res.status(status).json(body as ApiError);
  }
}
