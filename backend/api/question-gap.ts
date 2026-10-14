// api/question-gap.ts — POST /api/question-gap
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import {
  analyzeQuestionGap, MAX_SOURCES, MAX_CONTENT_CHARS,
  type GapMode, type GapSource,
} from '../services/questionGapService';
import { createDailyLimiter } from '../services/dailyLimiter';
import { classifyGeminiError } from '../services/geminiErrors';
import type { ApiError } from '../types';

const MODES: GapMode[] = ['citation', 'share_of_voice', 'sentiment'];
export const takeSlot = createDailyLimiter(20);

const clean = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

function domainOf(v: string | null): string | null {
  if (!v) return null;
  try {
    return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);

  const b = req.body as Record<string, any>;
  const question = clean(b.question, 300);
  if (!question || question.length < 8) {
    return res.status(400).json({ error: 'bad_request', message: 'question is required' } as ApiError);
  }
  const mode: GapMode = MODES.includes(b.mode) ? b.mode : 'citation';
  const domain = domainOf(clean(b.url, 300));
  const content = clean(b.content, MAX_CONTENT_CHARS);

  const sources: GapSource[] = (Array.isArray(b.sources) ? b.sources : []).slice(0, MAX_SOURCES)
    .map((s: any) => ({
      domain: (clean(s?.domain, 120) || '').replace(/^www\./, ''),
      title: clean(s?.title, 160) || undefined,
      snippet: clean(s?.snippet, 240) || undefined,
    }))
    .filter((s: GapSource) => s.domain);
  const competitors = (Array.isArray(b.competitors) ? b.competitors : [])
    .map((c: unknown) => clean(c, 120)).filter(Boolean).slice(0, MAX_SOURCES) as string[];

  // Whether they were cited is derived on the server from the sources we were
  // given, never taken from the client, and is unknown without a site.
  let cited: boolean | null = null;
  let rank: number | null = null;
  if (domain) {
    const idx = sources.findIndex(s => s.domain === domain || s.domain.endsWith(`.${domain}`) || domain.endsWith(`.${s.domain}`));
    cited = idx >= 0;
    rank = idx >= 0 ? idx + 1 : null;
  }

  if (!takeSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have used this 20 times today. Try again tomorrow.' } as ApiError);
  }

  try {
    const gap = await analyzeQuestionGap({
      question, mode, domain, content, sources, competitors, cited, rank,
      brand: clean(b.brand, 120),
      note: clean(b.note, 300),
    });
    if (!gap) {
      return res.status(502).json({ error: 'no_advice', message: 'Could not put advice together this time. Try again.' } as ApiError);
    }
    return res.status(200).json({ success: true, cited, rank, ...gap });
  } catch (error) {
    const { status, body } = classifyGeminiError(error, 'question-gap');
    return res.status(status).json(body as ApiError);
  }
}
