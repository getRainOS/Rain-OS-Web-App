// api/lane-stats.ts — GET /api/lane-stats
// Per lane: how many analyses and checks the user ran, and when they last
// used it. One Citation Monitor run asks several engines but counts as one
// check (its Gemini row); weekly re-checks are automatic and not counted.
// Checks saved before lanes were recorded have no lane and aren't counted.
import express from 'express';
import { pool } from '../services/db';
import { findUserByApiKey } from '../services/dbService';
import type { ApiError } from '../types';

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);

  const r = await pool.query(
    `SELECT lane, SUM(analyses)::int AS analyses, SUM(checks)::int AS checks, MAX(last_at) AS last_used FROM (
       SELECT lane, COUNT(*) AS analyses, 0 AS checks, MAX(analyzed_at) AS last_at
         FROM content_analyses WHERE user_id = $1 AND lane IS NOT NULL GROUP BY lane
       UNION ALL
       SELECT lane, 0, COUNT(*), MAX(checked_at) FROM citation_checks
         WHERE user_id = $1 AND lane IS NOT NULL AND engine = 'gemini' AND source = 'manual' GROUP BY lane
       UNION ALL
       SELECT lane, 0, COUNT(*), MAX(checked_at) FROM brand_visibility_checks WHERE user_id = $1 AND lane IS NOT NULL GROUP BY lane
       UNION ALL
       SELECT lane, 0, COUNT(*), MAX(checked_at) FROM sov_checks WHERE user_id = $1 AND lane IS NOT NULL GROUP BY lane
     ) t GROUP BY lane`,
    [user.id]
  );
  const lanes: Record<string, { analyses: number; checks: number; lastUsed: string | null }> = {};
  for (const row of r.rows) {
    lanes[row.lane] = {
      analyses: row.analyses,
      checks: row.checks,
      lastUsed: row.last_used instanceof Date ? row.last_used.toISOString() : row.last_used,
    };
  }
  return res.status(200).json({ success: true, lanes });
}
