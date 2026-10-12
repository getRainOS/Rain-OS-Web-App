// services/trackedQueryService.ts — tracked queries for weekly citation re-checks.
import { pool } from './db';
import { normaliseTopicKey } from './dbService';
import type { User } from '../types';

export const PRO_TRACKING_CAP = 10;
export const BUSINESS_TRACKING_CAP = 30;
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_JITTER_MS = 6 * 60 * 60 * 1000;

export type PausedReason = 'user' | 'plan_limit' | 'failures';

export interface TrackedQuery {
  id: number;
  name: string;
  topic: string;
  url: string | null;
  nextRunAt: string;
  lastRunAt: string | null;
  lastCited: boolean | null;
  consecutiveFailures: number;
  pausedReason: PausedReason | null;
  createdAt: string;
  history: Array<{ cited: boolean; checkedAt: string }>;
}

export class TrackingError extends Error {
  constructor(public code: 'plan_required' | 'cap_reached' | 'duplicate' | 'not_found', message: string) {
    super(message);
  }
}

const iso = (v: any): string | null => (v == null ? null : v instanceof Date ? v.toISOString() : String(v));

const mapRow = (row: any): TrackedQuery => ({
  id: Number(row.id),
  name: row.name,
  topic: row.topic,
  url: row.url,
  nextRunAt: iso(row.next_run_at) as string,
  lastRunAt: iso(row.last_run_at),
  lastCited: row.last_cited,
  consecutiveFailures: row.consecutive_failures,
  pausedReason: row.paused_reason,
  createdAt: iso(row.created_at) as string,
  history: Array.isArray(row.history)
    ? row.history.map((h: any) => ({ cited: !!h.cited, checkedAt: iso(h.checked_at) as string }))
    : [],
});

// Pro and Business only. Price IDs come from the same env vars stripeService
// uses; the usage-limit fallback covers plans whose limit came from Stripe
// price metadata instead.
export function planTrackingCap(user: Pick<User, 'subscriptionStatus' | 'stripePriceId' | 'usage'>): number {
  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') return 0;
  const business = process.env.STRIPE_PRICE_ID_BUSINESS;
  const pro = process.env.STRIPE_PRICE_ID_PRO;
  if (business && user.stripePriceId === business) return BUSINESS_TRACKING_CAP;
  if (pro && user.stripePriceId === pro) return PRO_TRACKING_CAP;
  const limit = user.usage?.limit ?? 0;
  if (limit >= 500) return BUSINESS_TRACKING_CAP;
  if (limit >= 200) return PRO_TRACKING_CAP;
  return 0;
}

export function firstRunAt(now = Date.now(), random = Math.random): Date {
  return new Date(now + WEEK_MS + Math.floor(random() * MAX_JITTER_MS));
}

// Pauses the newest queries beyond the plan's cap and resumes plan-paused
// ones while there is room, so downgrades and upgrades settle on their own.
export async function enforcePlanCap(userId: string, cap: number): Promise<void> {
  await pool.query(
    `UPDATE tracked_queries SET paused_reason = 'plan_limit'
     WHERE user_id = $1 AND paused_reason IS NULL AND id IN (
       SELECT id FROM tracked_queries WHERE user_id = $1 AND paused_reason IS NULL
       ORDER BY created_at ASC, id ASC OFFSET $2
     )`,
    [userId, cap]
  );
  const active = await pool.query(
    `SELECT COUNT(*)::int AS n FROM tracked_queries WHERE user_id = $1 AND paused_reason IS NULL`,
    [userId]
  );
  const room = Math.max(0, cap - active.rows[0].n);
  if (room === 0) return;
  await pool.query(
    `UPDATE tracked_queries SET paused_reason = NULL,
       next_run_at = GREATEST(next_run_at, NOW())
     WHERE id IN (
       SELECT id FROM tracked_queries WHERE user_id = $1 AND paused_reason = 'plan_limit'
       ORDER BY created_at ASC, id ASC
       LIMIT $2
     )`,
    [userId, room]
  );
}

export async function listTrackedQueries(userId: string): Promise<TrackedQuery[]> {
  const res = await pool.query(
    `SELECT t.*,
       COALESCE((
         SELECT json_agg(h ORDER BY h.checked_at ASC) FROM (
           SELECT cited, checked_at FROM citation_checks
           WHERE tracked_query_id = t.id
           ORDER BY checked_at DESC LIMIT 12
         ) h
       ), '[]'::json) AS history
     FROM tracked_queries t
     WHERE t.user_id = $1
     ORDER BY t.created_at ASC, t.id ASC`,
    [userId]
  );
  return res.rows.map(mapRow);
}

export async function createTrackedQuery(
  user: User,
  data: { name: string; topic: string; url: string | null; lastCited?: boolean | null; checkId?: number | null }
): Promise<TrackedQuery> {
  const cap = planTrackingCap(user);
  if (cap === 0) throw new TrackingError('plan_required', 'Weekly tracking is available on Pro and Business plans.');

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS n FROM tracked_queries WHERE user_id = $1 AND paused_reason IS DISTINCT FROM 'plan_limit'`,
    [user.id]
  );
  if (countRes.rows[0].n >= cap) {
    throw new TrackingError('cap_reached', `Your plan tracks up to ${cap} queries. Remove one to add another.`);
  }

  const res = await pool.query(
    `INSERT INTO tracked_queries (user_id, name, topic, topic_key, url, next_run_at, last_cited, last_run_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $7::boolean IS NULL THEN NULL ELSE NOW() END)
     ON CONFLICT (user_id, topic_key) DO NOTHING
     RETURNING *`,
    [user.id, data.name, data.topic, normaliseTopicKey(data.topic), data.url, firstRunAt(), data.lastCited ?? null]
  );
  if (!res.rows[0]) throw new TrackingError('duplicate', 'You are already tracking this question.');

  if (data.checkId) {
    await pool.query(
      `UPDATE citation_checks SET tracked_query_id = $1 WHERE id = $2 AND user_id = $3`,
      [res.rows[0].id, data.checkId, user.id]
    );
  }
  return mapRow({ ...res.rows[0], history: [] });
}

export async function setTrackedQueryPaused(user: User, id: number, paused: boolean): Promise<void> {
  if (paused) {
    const res = await pool.query(
      `UPDATE tracked_queries SET paused_reason = 'user' WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );
    if (!res.rowCount) throw new TrackingError('not_found', 'Tracked query not found.');
    return;
  }
  const cap = planTrackingCap(user);
  const active = await pool.query(
    `SELECT COUNT(*)::int AS n FROM tracked_queries WHERE user_id = $1 AND paused_reason IS NULL AND id <> $2`,
    [user.id, id]
  );
  if (active.rows[0].n >= cap) {
    throw new TrackingError(cap === 0 ? 'plan_required' : 'cap_reached',
      cap === 0 ? 'Weekly tracking is available on Pro and Business plans.' : `Your plan tracks up to ${cap} queries at once.`);
  }
  const res = await pool.query(
    `UPDATE tracked_queries
     SET paused_reason = NULL, consecutive_failures = 0, next_run_at = GREATEST(next_run_at, NOW())
     WHERE id = $1 AND user_id = $2`,
    [id, user.id]
  );
  if (!res.rowCount) throw new TrackingError('not_found', 'Tracked query not found.');
}

export async function deleteTrackedQuery(userId: string, id: number): Promise<boolean> {
  const res = await pool.query(`DELETE FROM tracked_queries WHERE id = $1 AND user_id = $2`, [id, userId]);
  return (res.rowCount ?? 0) > 0;
}
