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

export function isAdminEmail(email: string | undefined, env: NodeJS.ProcessEnv = process.env): boolean {
  const list = (env.ADMIN_EMAILS || 'support@getrainos.com').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

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
