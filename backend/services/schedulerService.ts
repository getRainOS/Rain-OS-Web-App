// services/schedulerService.ts — runs due tracked queries on a timer inside the API server.
import { pool } from './db';
import { findUserById, saveCitationCheck } from './dbService';
import { runCitationCheck } from './citationCheckService';
import { sendCitationStatusEmail } from './emailService';
import { planTrackingCap, enforcePlanCap, WEEK_MS, MAX_JITTER_MS } from './trackedQueryService';

const TICK_MS = 10 * 60 * 1000;
const BATCH_SIZE = 20;
const RETRY_MS = 60 * 60 * 1000;
const MAX_FAILURES = 3;
const DEFAULT_DAILY_CEILING = 1200;

export function dailyCeiling(): number {
  const n = parseInt(process.env.SCHEDULER_MAX_DAILY_CHECKS || '', 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DAILY_CEILING;
}

async function scheduledChecksToday(): Promise<number> {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS n FROM citation_checks
     WHERE source = 'scheduled' AND checked_at >= date_trunc('day', NOW())`
  );
  return res.rows[0].n;
}

// Claiming and rescheduling happen in one statement under SKIP LOCKED, so
// concurrent replicas or overlapping ticks never run the same query twice.
async function claimDue(limit: number): Promise<any[]> {
  const res = await pool.query(
    `UPDATE tracked_queries t
     SET next_run_at = NOW() + ($2::float8 * INTERVAL '1 millisecond')
                             + (random() * $3::float8 * INTERVAL '1 millisecond')
     WHERE t.id IN (
       SELECT id FROM tracked_queries
       WHERE paused_reason IS NULL AND next_run_at <= NOW()
       ORDER BY next_run_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING t.*`,
    [limit, WEEK_MS, MAX_JITTER_MS]
  );
  return res.rows;
}

export async function runTrackedQuery(row: any): Promise<'ran' | 'skipped' | 'failed'> {
  const user = await findUserById(row.user_id);
  if (!user) return 'skipped';

  const cap = planTrackingCap(user);
  await enforcePlanCap(user.id, cap);
  if (cap === 0) return 'skipped';
  const still = await pool.query(`SELECT paused_reason FROM tracked_queries WHERE id = $1`, [row.id]);
  if (!still.rows[0] || still.rows[0].paused_reason) return 'skipped';

  try {
    const result = await runCitationCheck(row.topic, row.url);
    await saveCitationCheck(user.id, {
      name: row.name,
      topic: result.topic,
      url: result.url,
      cited: result.cited,
      alignmentScore: 0,
      sources: result.sources,
      recommendations: [],
      summary: result.summary,
      source: 'scheduled',
      trackedQueryId: Number(row.id),
    });
    await pool.query(
      `UPDATE tracked_queries SET last_run_at = NOW(), last_cited = $2, consecutive_failures = 0 WHERE id = $1`,
      [row.id, result.cited]
    );
    const changed = row.last_cited !== null && row.last_cited !== undefined && row.last_cited !== result.cited;
    if (changed && user.citationAlerts !== false) {
      await sendCitationStatusEmail(user.email, { name: row.name, topic: row.topic, cited: result.cited });
    }
    return 'ran';
  } catch (err) {
    console.error(`[scheduler] tracked query ${row.id} failed:`, err instanceof Error ? err.message : err);
    const failures = (row.consecutive_failures || 0) + 1;
    if (failures >= MAX_FAILURES) {
      await pool.query(
        `UPDATE tracked_queries SET consecutive_failures = $2, paused_reason = 'failures' WHERE id = $1`,
        [row.id, failures]
      );
    } else {
      await pool.query(
        `UPDATE tracked_queries SET consecutive_failures = $2,
           next_run_at = NOW() + ($3::float8 * INTERVAL '1 millisecond') WHERE id = $1`,
        [row.id, failures, RETRY_MS]
      );
    }
    return 'failed';
  }
}

export async function runSchedulerTick(): Promise<{ claimed: number; ran: number; failed: number }> {
  const room = dailyCeiling() - (await scheduledChecksToday());
  if (room <= 0) return { claimed: 0, ran: 0, failed: 0 };
  const rows = await claimDue(Math.min(BATCH_SIZE, room));
  let ran = 0;
  let failed = 0;
  for (const row of rows) {
    const outcome = await runTrackedQuery(row);
    if (outcome === 'ran') ran++;
    if (outcome === 'failed') failed++;
  }
  if (rows.length) console.log(`[scheduler] claimed=${rows.length} ran=${ran} failed=${failed}`);
  return { claimed: rows.length, ran, failed };
}

let timer: NodeJS.Timeout | null = null;
let running = false;

export function startScheduler(): void {
  if (process.env.SCHEDULER_ENABLED === 'false') {
    console.log('[scheduler] disabled by SCHEDULER_ENABLED=false');
    return;
  }
  if (timer) return;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runSchedulerTick();
    } catch (err) {
      console.error('[scheduler] tick failed:', err instanceof Error ? err.message : err);
    } finally {
      running = false;
    }
  };
  timer = setInterval(tick, TICK_MS);
  timer.unref();
  setTimeout(tick, 60 * 1000).unref();
  console.log('[scheduler] started');
}
