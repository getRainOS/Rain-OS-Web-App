// services/schedulerService.ts — runs due tracked queries on a timer inside the API server.
import { pool } from './db';
import { findUserById, saveCitationCheck } from './dbService';
import { mentionedIn } from './brandMatch';
import { runCitationCheck } from './citationCheckService';
import { runEngineCheck } from './engines/run';
import { normaliseLocation } from './engines/location';
import { availableEngines, engineLabel } from './engines';
import { stepAlertState, type EngineAlertState } from './alertState';
import { sendCitationStatusEmail } from './emailService';
import { sendWeeklyDigests } from './weeklyDigest';
import { planTrackingCap, enforcePlanCap, hasMatchableSite, WEEK_MS, MAX_JITTER_MS } from './trackedQueryService';

const TICK_MS = 10 * 60 * 1000;
const BATCH_SIZE = 20;
const RETRY_MS = 60 * 60 * 1000;
const MAX_FAILURES = 3;
const CONFIRM_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAILY_CEILING = 1200;

export function dailyCeiling(): number {
  const n = parseInt(process.env.SCHEDULER_MAX_DAILY_CHECKS || '', 10);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DAILY_CEILING;
}

async function scheduledChecksToday(): Promise<number> {
  const res = await pool.query(
    `SELECT COUNT(*)::int AS n FROM citation_checks
     WHERE source = 'scheduled' AND engine = 'gemini' AND checked_at >= date_trunc('day', NOW())`
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

  // No matchable website means every check would say "not cited". Don't spend
  // a Gemini call on it; pause until the user adds a site.
  if (!hasMatchableSite(row.url) && !row.brand) {
    await pool.query(`UPDATE tracked_queries SET paused_reason = 'no_site' WHERE id = $1`, [row.id]);
    return 'skipped';
  }

  try {
    const { answerText, ...result } = await runCitationCheck(row.topic, row.url);
    await saveCitationCheck(user.id, {
      brand: row.brand ?? null, mentioned: mentionedIn(row.brand ?? null, answerText), subject: row.subject ?? null,
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
    // One check is a single noisy sample, so a change is only believed (and
    // emailed) when the next check, a day later, agrees. The first result
    // is the baseline and never alerts.
    const changes: Array<{ engine: string; cited: boolean }> = [];
    const previous: boolean | null = row.last_cited ?? null;
    if (previous === null || previous === result.cited) {
      await pool.query(
        `UPDATE tracked_queries SET last_run_at = NOW(), last_cited = $2, pending_cited = NULL, consecutive_failures = 0 WHERE id = $1`,
        [row.id, result.cited]
      );
    } else if (row.pending_cited === result.cited) {
      await pool.query(
        `UPDATE tracked_queries SET last_run_at = NOW(), last_cited = $2, pending_cited = NULL, consecutive_failures = 0 WHERE id = $1`,
        [row.id, result.cited]
      );
      changes.push({ engine: 'Gemini', cited: result.cited });
    } else {
      await pool.query(
        `UPDATE tracked_queries SET last_run_at = NOW(), pending_cited = $2, consecutive_failures = 0,
           next_run_at = NOW() + ($3::float8 * INTERVAL '1 millisecond') WHERE id = $1`,
        [row.id, result.cited, CONFIRM_MS]
      );
    }
    changes.push(...(await runOtherEngines(row, user)));
    // One email per run, listing every engine whose status really changed.
    if (changes.length && user.citationAlerts !== false) {
      await sendCitationStatusEmail(user.email, { name: row.name, topic: row.topic, changes });
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

// The same question on every other available engine (ChatGPT, AI Overviews,
// …), from the question's own location. Each engine has its own
// confirm-then-alert state in tracked_queries.engine_state; returns the
// changes confirmed this run. A failing engine is logged and skipped, so it
// never blocks the others or the Gemini result.
async function runOtherEngines(row: any, user: { id: string; locationState?: string | null }): Promise<Array<{ engine: string; cited: boolean }>> {
  const states: Record<string, EngineAlertState> = row.engine_state && typeof row.engine_state === 'object' ? { ...row.engine_state } : {};
  const changes: Array<{ engine: string; cited: boolean }> = [];
  let needsConfirm = false;
  for (const engine of availableEngines().filter(e => e.id !== 'gemini')) {
    try {
      const loc = row.location_country
        ? normaliseLocation(row.location_country, row.location_state)
        : normaliseLocation('US', undefined, user.locationState ?? null);
      const { answerText, ...result } = await runEngineCheck(engine.id, row.topic, row.url, loc.state, loc.country);
      await saveCitationCheck(user.id, {
        brand: row.brand ?? null, mentioned: mentionedIn(row.brand ?? null, answerText), subject: row.subject ?? null,
        name: row.name, topic: result.topic, url: result.url, cited: result.cited, alignmentScore: 0,
        sources: result.sources, recommendations: [], summary: result.summary,
        source: 'scheduled', trackedQueryId: Number(row.id), engine: engine.id,
        locationCountry: loc.country, locationState: loc.state,
      });
      const step = stepAlertState(states[engine.id], result.cited, (result as any).answerShown !== false);
      states[engine.id] = step.state;
      if (step.confirmed !== null) changes.push({ engine: engineLabel(engine.id), cited: step.confirmed });
      if (step.needsConfirm) needsConfirm = true;
    } catch (err) {
      console.error(`[scheduler] ${engine.id} check for tracked query ${row.id} failed:`, err instanceof Error ? err.message : err);
    }
  }
  await pool.query(
    `UPDATE tracked_queries SET engine_state = $2::jsonb${needsConfirm ? `,
       next_run_at = LEAST(next_run_at, NOW() + ($3::float8 * INTERVAL '1 millisecond'))` : ''} WHERE id = $1`,
    needsConfirm ? [row.id, JSON.stringify(states), CONFIRM_MS] : [row.id, JSON.stringify(states)]
  );
  return changes;
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
    }
    try {
      await sendWeeklyDigests();
    } catch (err) {
      console.error('[digest] failed:', err instanceof Error ? err.message : err);
    } finally {
      running = false;
    }
  };
  timer = setInterval(tick, TICK_MS);
  timer.unref();
  setTimeout(tick, 60 * 1000).unref();
  console.log('[scheduler] started');
}
