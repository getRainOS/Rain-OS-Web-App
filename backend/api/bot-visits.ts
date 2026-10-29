// api/bot-visits.ts — AI crawler visits. Ingest is called by the small snippet a
// site owner adds to their server (with their API key); the summary feeds the
// dashboard card.
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { recordBotHits, summarizeBotVisits, type BotHit, classifyBot } from '../services/botVisits';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

const MAX_HITS_PER_REQUEST = 100;

// POST { site, hits: [{ userAgent, path }] } — the server classifies each User-Agent
// itself, so the snippet can't inflate counts by naming a bot it doesn't see.
export async function ingestBotVisitsHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);

  const { site, hits } = req.body as { site?: unknown; hits?: unknown };
  if (typeof site !== 'string' || !/^[a-z0-9.-]{1,253}$/i.test(site)) {
    return res.status(400).json({ error: 'bad_request', message: 'site must be a domain, like example.com' } as ApiError);
  }
  if (!Array.isArray(hits) || hits.length > MAX_HITS_PER_REQUEST) {
    return res.status(400).json({ error: 'bad_request', message: `hits must be a list of up to ${MAX_HITS_PER_REQUEST}` } as ApiError);
  }
  const classified: BotHit[] = [];
  for (const h of hits as Array<{ userAgent?: unknown; path?: unknown }>) {
    if (typeof h?.userAgent !== 'string' || typeof h?.path !== 'string') continue;
    const bot = classifyBot(h.userAgent);
    if (bot) classified.push({ bot, path: h.path });
  }
  try {
    const recorded = await recordBotHits(user.id, site, classified);
    return res.status(200).json({ success: true, recorded });
  } catch (err) {
    console.error('bot visits ingest failed:', err);
    return res.status(500).json({ error: 'internal_server_error', message: 'Could not record visits.' } as ApiError);
  }
}

// GET ?days=7 — totals for the signed-in account (the dashboard uses the same key).
export async function botVisitsSummaryHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 7));
  try {
    return res.status(200).json({ success: true, data: await summarizeBotVisits(user.id, days) });
  } catch (err) {
    console.error('bot visits summary failed:', err);
    return res.status(500).json({ error: 'internal_server_error', message: 'Could not load visits.' } as ApiError);
  }
}
