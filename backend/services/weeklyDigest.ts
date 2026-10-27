// services/weeklyDigest.ts — one short email a week: did AI recommend you,
// one fix to make, and one place to show up. Built only from checks and
// analyses already saved (the weekly tracking runs), so it costs no AI calls.
import { pool } from './db';
import { escapeHtml, getAppUrl, sendEmail } from './emailService';

export interface DigestCheck { brand?: string | null; url?: string | null; cited?: boolean | null; mentioned?: boolean | null; sources?: Array<{ domain?: string; url?: string }> | null }

const bare = (d: string) => d.toLowerCase().replace(/^www\./, '');
const domainOf = (u?: string | null) => { try { return u ? bare(new URL(u).hostname) : null; } catch { return null; } };

// Review and listing sites get a concrete tip; anything else a general one.
const REVIEW_SITES = ['yelp.com', 'google.com', 'tripadvisor.com', 'bbb.org', 'angi.com', 'thumbtack.com', 'houzz.com', 'zocdoc.com',
  'healthgrades.com', 'avvo.com', 'g2.com', 'capterra.com', 'trustpilot.com', 'yellowpages.com', 'nextdoor.com', 'opentable.com'];
export function sourceTip(domain: string): string {
  if (REVIEW_SITES.some(d => domain === d || domain.endsWith(`.${d}`))) return `Make sure you're listed on ${domain} with current details, and ask happy customers for a review there.`;
  if (/(^|\.)reddit\.com$|(^|\.)quora\.com$/.test(domain)) return `People's discussions on ${domain} shape these answers. Answer questions there honestly, as yourself.`;
  return `See what ${domain} covers that your page doesn't, and add it. Fix with AI can help.`;
}

export interface WeekSummary { name: string; answers: number; recommended: number; previous: { answers: number; recommended: number }; topSource: string | null }

const isYes = (c: DigestCheck) => c.mentioned === true || c.cited === true;

export function summarizeWeek(week: DigestCheck[], lastWeek: DigestCheck[]): WeekSummary {
  const names = new Map<string, number>();
  const own = new Set<string>();
  for (const c of week) {
    const n = (c.brand || '').trim() || domainOf(c.url) || '';
    if (n) names.set(n, (names.get(n) || 0) + 1);
    const d = domainOf(c.url);
    if (d) own.add(d);
  }
  const sources = new Map<string, number>();
  for (const c of week) {
    const seen = new Set<string>();
    for (const s of c.sources || []) {
      const d = s.domain ? bare(s.domain) : domainOf(s.url);
      if (!d || seen.has(d) || [...own].some(o => d === o || d.endsWith(`.${o}`))) continue;
      seen.add(d);
      sources.set(d, (sources.get(d) || 0) + 1);
    }
  }
  const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return {
    name: top(names) || 'your business',
    answers: week.length,
    recommended: week.filter(isYes).length,
    previous: { answers: lastWeek.length, recommended: lastWeek.filter(isYes).length },
    topSource: top(sources),
  };
}

export function digestEmail(s: WeekSummary, fix: { text: string; href: string } | null): { subject: string; html: string } {
  const app = getAppUrl();
  const rate = (r: number, a: number) => (a ? r / a : 0);
  const now = rate(s.recommended, s.answers);
  const before = rate(s.previous.recommended, s.previous.answers);
  const trend = !s.previous.answers ? '' : now > before ? ' That’s up from last week.' : now < before ? ' That’s down from last week.' : ' Same as last week.';
  const headline = s.recommended
    ? `AI recommended ${s.name} in ${s.recommended} of ${s.answers} answers this week`
    : `AI didn’t recommend ${s.name} in its ${s.answers} answers this week`;
  const button = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block; padding: 10px 18px; background: #2B8FE3; color: #fff; text-decoration: none; border-radius: 6px;">${label}</a>`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Your week in AI answers</p>
      <h1 style="font-size: 20px; margin: 0 0 8px;">${escapeHtml(headline)}</h1>
      <p style="margin: 0 0 20px;">${s.recommended ? 'Named or cited as a source.' : 'Answers rarely change in a week; steady fixes add up.'}${trend}</p>
      ${fix ? `<h2 style="font-size: 15px; margin: 0 0 6px;">One thing to fix</h2>
      <p style="margin: 0 0 10px;">${escapeHtml(fix.text)}</p>
      <p style="margin: 0 0 20px;">${button(`${app}${fix.href}`, 'Fix it with AI')}</p>` : ''}
      ${s.topSource ? `<h2 style="font-size: 15px; margin: 0 0 6px;">Where AI looked</h2>
      <p style="margin: 0 0 20px;">Most answers used ${escapeHtml(s.topSource)}. ${escapeHtml(sourceTip(s.topSource))}</p>` : ''}
      <p style="margin: 0 0 20px;">${button(`${app}/dashboard`, 'Open your dashboard')}</p>
      <p style="color: #666; font-size: 12px;">You get this because you track questions in rain OS. <a href="${app}/settings" style="color:#666;">Turn off these emails in Settings</a>.</p>
    </div>`;
  const subject = s.recommended ? `AI recommended you ${s.recommended} of ${s.answers} times this week` : 'Your week in AI answers';
  return { subject, html };
}

// The top open fix on the user's most recent analysis, and where to fix it.
async function topFix(userId: string): Promise<{ text: string; href: string } | null> {
  const r = await pool.query(
    `SELECT id, url, repo, series_id, result_json->'recommendations'->0 AS rec FROM content_analyses
     WHERE user_id = $1 ORDER BY analyzed_at DESC LIMIT 1`, [userId]);
  const row = r.rows[0];
  const rec = row?.rec;
  const text = typeof rec === 'string' ? rec : rec && typeof rec.text === 'string' ? rec.text : '';
  if (!row || !text.trim()) return null;
  const href = row.repo ? '/repo-analysis' : row.url && !row.series_id ? `/url-scanner?url=${encodeURIComponent(row.url)}` : `/analyze/${row.id}?fix=1`;
  return { text: text.trim().slice(0, 280), href };
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Mondays from 14:00 UTC (morning across the US), once per user per week,
// only for users who track questions, have alerts on and had checks this week.
export async function sendWeeklyDigests(now = new Date(), limit = 50): Promise<number> {
  if (now.getUTCDay() !== 1 || now.getUTCHours() < 14) return 0;
  const users = await pool.query(
    `SELECT u.id, u.email FROM users u
     WHERE u.citation_alerts IS NOT FALSE
       AND (u.last_digest_at IS NULL OR u.last_digest_at < $1)
       AND EXISTS (SELECT 1 FROM tracked_queries t WHERE t.user_id = u.id)
     LIMIT $2`, [new Date(now.getTime() - 6 * DAY_MS), limit]);
  let sent = 0;
  for (const u of users.rows) {
    // Mark first, so a failure can't resend on every tick.
    await pool.query(`UPDATE users SET last_digest_at = $2 WHERE id = $1`, [u.id, now]);
    const checks = await pool.query(
      `SELECT brand, url, cited, mentioned, sources, checked_at > $2 AS this_week FROM citation_checks
       WHERE user_id = $1 AND checked_at > $3`, [u.id, new Date(now.getTime() - 7 * DAY_MS), new Date(now.getTime() - 14 * DAY_MS)]);
    const week = checks.rows.filter(c => c.this_week);
    if (!week.length) continue;
    const { subject, html } = digestEmail(summarizeWeek(week, checks.rows.filter(c => !c.this_week)), await topFix(u.id));
    await sendEmail(u.email, subject, html);
    sent++;
  }
  if (sent) console.log(`[digest] sent ${sent} weekly emails`);
  return sent;
}
