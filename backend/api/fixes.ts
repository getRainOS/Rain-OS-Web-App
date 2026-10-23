// api/fixes.ts — POST /api/fixes/check: re-measure the listed fixes on edited
// text, so the ones actually done drop off without a new analysis. Exact
// measurements only; no AI call, no credit used.
import express from 'express';
import { findUserByApiKey, getAnalysesByUser } from '../services/dbService';
import { computeReadabilityMetrics } from '../services/readability';
import { contentTypeId, fixStatus } from '../services/contentTypes';
import type { ApiError } from '../types';

const getApiKey = (req: express.Request): string | null => {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
};

export async function fixesCheckHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  const user = apiKey ? await findUserByApiKey(apiKey) : null;
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'API key missing or invalid' } as ApiError);

  const content = typeof req.body?.content === 'string' ? req.body.content.slice(0, 60000) : '';
  const fixes = Array.isArray(req.body?.fixes) ? req.body.fixes.slice(0, 50) : [];
  const clean = fixes
    .filter((f: any) => f && typeof f.id === 'string')
    .map((f: any) => ({
      id: String(f.id).slice(0, 80),
      source: f.source === 'measured' ? 'measured' as const : 'judged' as const,
      metric: typeof f.metric === 'string' ? f.metric : undefined,
      sub: typeof f.sub === 'string' ? f.sub : undefined,
    }));
  const type = contentTypeId(typeof req.body?.contentType === 'string' ? req.body.contentType : null);
  return res.json({ success: true, status: fixStatus(clean, computeReadabilityMetrics(content), content, type) });
}

// GET /api/fixes/summary — fixes still waiting on each piece's latest
// analysis (re-analyzing or accepting a rewrite replaces the list), for the
// dashboard's "fixes available" card.
export async function fixesSummaryHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  const user = apiKey ? await findUserByApiKey(apiKey) : null;
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'API key missing or invalid' } as ApiError);
  const lane = typeof req.headers['x-rain-lane'] === 'string' ? req.headers['x-rain-lane'] : null;
  const rows = await getAnalysesByUser(user.id, 100, lane);
  const seen = new Set<number>();
  const pieces: Array<{ id: number; title: string; fixes: number; score: number | null }> = [];
  for (const r of rows) { // newest first, so the first of each series is its latest
    if (r.url || r.repo) continue;
    const series = r.series_id ?? r.id;
    if (seen.has(series)) continue;
    seen.add(series);
    const n = (r.recommendations || []).length;
    if (n) pieces.push({ id: r.id, title: r.title || 'Untitled piece', fixes: n, score: r.overall_score });
  }
  pieces.sort((a, b) => b.fixes - a.fixes);
  return res.json({ success: true, totalFixes: pieces.reduce((s, p) => s + p.fixes, 0), pieces: pieces.slice(0, 5) });
}
