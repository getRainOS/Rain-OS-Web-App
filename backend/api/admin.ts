// api/admin.ts — GET /api/admin/grounding-usage (rain OS staff only).
// Daily grounded Gemini calls for the last 30 days, against the free allowance.
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { pool } from '../services/db';
import type { ApiError } from '../types';

// Reported free allowance and paid rate for Gemini 2.5 grounding. Check
// Google's pricing page and update these if they change.
export const FREE_GROUNDED_PER_DAY = 1500;
export const USD_PER_1000_GROUNDED = 35;

import { isAdminEmail } from '../services/planLimits';
export { isAdminEmail };

export async function groundingUsageHandler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  const user = apiKey ? await findUserByApiKey(apiKey) : null;
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Sign in first.' } as ApiError);
  if (!isAdminEmail(user.email)) return res.status(403).json({ error: 'forbidden', message: 'This page is for rain OS staff.' } as ApiError);

  const rows = await pool.query(
    `SELECT to_char(day, 'YYYY-MM-DD') AS day, kind, calls FROM grounded_calls_daily
     WHERE day >= CURRENT_DATE - INTERVAL '29 days' ORDER BY day DESC, kind`
  );
  const byDay = new Map<string, { day: string; total: number; kinds: Record<string, number> }>();
  for (const r of rows.rows) {
    const d = byDay.get(r.day) || { day: r.day as string, total: 0, kinds: {} as Record<string, number> };
    d.kinds[r.kind] = Number(r.calls);
    d.total += Number(r.calls);
    byDay.set(r.day, d);
  }
  const days = [...byDay.values()].map(d => ({
    ...d,
    paid: Math.max(d.total - FREE_GROUNDED_PER_DAY, 0),
    estCostUsd: Math.round(Math.max(d.total - FREE_GROUNDED_PER_DAY, 0) * USD_PER_1000_GROUNDED / 10) / 100,
  }));
  return res.status(200).json({ success: true, freePerDay: FREE_GROUNDED_PER_DAY, usdPer1000: USD_PER_1000_GROUNDED, days });
}

// ─── Test account reset (staff only; acts on test08@getrainos.com only) ───────
import { previewReset, startReset, job as resetJob } from '../services/testAccountSeed';

async function staff(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  const user = apiKey ? await findUserByApiKey(apiKey) : null;
  if (!user) { res.status(401).json({ error: 'unauthorized', message: 'Sign in first.' } as ApiError); return null; }
  if (!isAdminEmail(user.email)) { res.status(403).json({ error: 'forbidden', message: 'This page is for rain OS staff.' } as ApiError); return null; }
  return user;
}

// GET: what a reset would delete and add, and the progress of a running one.
export async function testAccountStatusHandler(req: express.Request, res: express.Response) {
  if (!(await staff(req, res))) return;
  try {
    return res.json({ success: true, preview: await previewReset(), job: resetJob });
  } catch (err: any) {
    return res.status(400).json({ error: 'bad_request', message: err?.message || 'Could not read the test account.' } as ApiError);
  }
}

// POST { confirm: 'support@getrainos.com' }: clean out and seed.
export async function testAccountResetHandler(req: express.Request, res: express.Response) {
  if (!(await staff(req, res))) return;
  if (req.body?.confirm !== TEST_EMAIL) {
    return res.status(400).json({ error: 'bad_request', message: 'Type the test account email to confirm.' } as ApiError);
  }
  try {
    await startReset(process.env.PORT || 3001);
    return res.status(202).json({ success: true, job: resetJob });
  } catch (err: any) {
    return res.status(400).json({ error: 'bad_request', message: err?.message || 'Could not start the reset.' } as ApiError);
  }
}
