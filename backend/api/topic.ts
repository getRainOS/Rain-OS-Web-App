// api/topic.ts — POST /api/topic/options (drill-down step) and POST /api/topic/questions
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { suggestTopicOptions, suggestTopicQuestions, LEVELS, MAX_PATH, type TopicLevel } from '../services/topicService';
import { createDailyLimiter } from '../services/dailyLimiter';
import { classifyGeminiError } from '../services/geminiErrors';
import type { ApiError, User } from '../types';

const optionsSlot = createDailyLimiter(80);
const questionsSlot = createDailyLimiter(20);

async function authUser(req: express.Request, res: express.Response): Promise<User | null> {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

const clean = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const cleanList = (v: unknown, n: number, max: number): string[] =>
  Array.isArray(v) ? v.map(x => clean(x, max)).filter((x): x is string => !!x).slice(0, n) : [];

export async function optionsHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const body = req.body as Record<string, unknown>;
  const path = cleanList(body.path, MAX_PATH, 80);
  if (path.length >= MAX_PATH) {
    return res.status(400).json({ error: 'bad_request', message: 'You have narrowed this as far as it goes. Generate questions instead.' } as ApiError);
  }
  const level: TopicLevel = LEVELS[path.length];
  if (!optionsSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have used today\'s topic suggestions. Try again tomorrow.' } as ApiError);
  }
  try {
    const options = await suggestTopicOptions({
      level,
      path,
      lane: clean(body.lane, 40) || 'general',
      site: clean(body.site, 200),
      known: cleanList(body.known, 8, 120),
    });
    if (!options.length) {
      return res.status(502).json({ error: 'no_options', message: 'Could not come up with options this time. Type your own below.' } as ApiError);
    }
    return res.status(200).json({ success: true, level, options });
  } catch (error) {
    const { status, body: b } = classifyGeminiError(error, 'topic-options');
    return res.status(status).json(b as ApiError);
  }
}

export async function questionsHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const body = req.body as Record<string, unknown>;
  const path = cleanList(body.path, MAX_PATH, 80);
  if (path.length < 1) {
    return res.status(400).json({ error: 'bad_request', message: 'Choose or type a topic first.' } as ApiError);
  }
  if (!questionsSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have generated questions 20 times today. Try again tomorrow.' } as ApiError);
  }
  const kind = body.kind === 'blog' || body.kind === 'article' ? body.kind : 'any';
  try {
    const questions = await suggestTopicQuestions({ path, lane: clean(body.lane, 40) || 'general', kind });
    if (!questions.length) {
      return res.status(502).json({ error: 'no_questions', message: 'Could not come up with questions this time. Try a more specific topic.' } as ApiError);
    }
    return res.status(200).json({ success: true, questions });
  } catch (error) {
    const { status, body: b } = classifyGeminiError(error, 'topic-questions');
    return res.status(status).json(b as ApiError);
  }
}
