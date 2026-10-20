// api/engine-check.ts — citation checks on engines other than Gemini.
//   GET  /api/engines                     → engines available right now
//   POST /api/citation-check/engine       → start (or reuse) a check; { engine, topic, url, name }
//   GET  /api/citation-check/engine/:id   → poll a running check
// A ChatGPT answer takes 25-70 seconds, so the check runs in the background:
// the page shows Gemini first and fills this in when ready, and the result is
// saved to History even if the user leaves. A check of the same question and
// site within 24 hours is reused instead of asking again.
import express from 'express';
import { randomUUID } from 'crypto';
import { findUserByApiKey, saveCitationCheck, findRecentCitationCheck } from '../services/dbService';
import { runEngineCitationCheck, EngineError } from '../services/engines/cloro';
import { availableEngines } from '../services/engines';
import { normaliseLocation } from '../services/engines/location';
import { isPaidPlan as isPaid } from '../services/planLimits';
import { findCitedSourceIndex, extractDomain } from '../services/citationCheckService';
import { createDailyLimiter } from '../services/dailyLimiter';
import type { ApiError } from '../types';

export const REUSE_HOURS = 24;
const takeSlot = createDailyLimiter(60);
const JOB_TTL_MS = 30 * 60 * 1000;

interface Job { userId: string; status: 'running' | 'done' | 'failed'; result?: any; error?: string; createdAt: number }
const jobs = new Map<string, Job>();

function sweep(now = Date.now()) {
  for (const [id, j] of jobs) if (now - j.createdAt > JOB_TTL_MS) jobs.delete(id);
}

async function authUser(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) { res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError); return null; }
  const user = await findUserByApiKey(apiKey);
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError); return null; }
  return user;
}

const fromRecord = (r: any) => ({
  topic: r.topic, url: r.url, cited: r.cited, sources: r.sources || [],
  citedSourceIndex: (() => { const i = findCitedSourceIndex(r.sources || [], r.url ? extractDomain(r.url) : null); return i >= 0 ? i : null; })(),
  summary: r.summary, engine: r.engine, checkId: r.id, checkedAt: r.checkedAt,
  country: r.locationCountry || 'US', state: r.locationState,
});

export async function enginesHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const paid = isPaid(user);
  return res.status(200).json({
    success: true,
    engines: availableEngines().map(e => ({ id: e.id, label: e.label, locked: e.id !== 'gemini' && !paid })),
  });
}

// Public: the engines live right now, for the marketing site. The copy names
// an engine only once its key is set, so it can't advertise one that isn't on.
export async function publicEnginesHandler(_req: express.Request, res: express.Response) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ success: true, engines: availableEngines().map(e => ({ id: e.id, name: e.short })) });
}

export async function startHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const engine = String(req.body?.engine || 'chatgpt');
  if (engine === 'gemini' || !availableEngines().some(e => e.id === engine)) {
    return res.status(400).json({ error: 'engine_unavailable', message: 'That AI engine is not available.' } as ApiError);
  }
  if (!isPaid(user)) {
    return res.status(402).json({ error: 'plan_required', message: `${engine === 'chatgpt' ? 'ChatGPT' : 'This engine'} checks are on Pro and Business plans.` } as ApiError);
  }
  const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim().slice(0, 500) : '';
  if (topic.length < 3) return res.status(400).json({ error: 'bad_request', message: 'topic is required' } as ApiError);
  let url: string | null = null;
  if (typeof req.body?.url === 'string' && req.body.url.trim()) {
    let c = req.body.url.trim();
    if (!/^https?:\/\//i.test(c)) c = 'https://' + c;
    try { new URL(c); url = c; } catch { return res.status(400).json({ error: 'bad_request', message: 'url is malformed' } as ApiError); }
  }
  const name = typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim().slice(0, 120) : topic.slice(0, 120);

  const loc = normaliseLocation(req.body?.country, req.body?.state, user.locationState ?? null);

  if (req.body?.fresh !== true) {
    const recent = await findRecentCitationCheck(user.id, topic, url, engine, REUSE_HOURS, loc);
    if (recent) return res.status(200).json({ success: true, status: 'done', reused: true, result: fromRecord(recent) });
  }
  if (!takeSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have run 60 ChatGPT checks today. Try again tomorrow.' } as ApiError);
  }

  sweep();
  const id = randomUUID();
  const job: Job = { userId: user.id, status: 'running', createdAt: Date.now() };
  jobs.set(id, job);
  (async () => {
    try {
      const result = await runEngineCitationCheck(engine, topic, url, loc.state, loc.country);
      const saved = await saveCitationCheck(user.id, {
        name, topic: result.topic, url: result.url, cited: result.cited, alignmentScore: 0,
        sources: result.sources, recommendations: [], summary: result.summary, engine,
        locationCountry: loc.country, locationState: loc.state,
      }).catch(err => { console.error('Saving engine check failed:', err); return null; });
      job.result = { ...result, checkId: saved?.id ?? null, checkedAt: new Date().toISOString() };
      job.status = 'done';
    } catch (err) {
      job.status = 'failed';
      job.error = err instanceof EngineError ? err.message : 'The check failed. Please try again.';
      if (!(err instanceof EngineError)) console.error('Engine check failed:', err);
    }
  })();
  return res.status(202).json({ success: true, status: 'running', jobId: id });
}

export async function pollHandler(req: express.Request, res: express.Response) {
  const user = await authUser(req, res);
  if (!user) return;
  const job = jobs.get(String(req.params.id));
  if (!job || job.userId !== user.id) {
    return res.status(404).json({ error: 'not_found', message: 'This check is no longer running. Its result, if any, is in History.' } as ApiError);
  }
  if (job.status === 'running') return res.status(200).json({ success: true, status: 'running' });
  if (job.status === 'failed') return res.status(200).json({ success: true, status: 'failed', message: job.error });
  return res.status(200).json({ success: true, status: 'done', result: job.result });
}
