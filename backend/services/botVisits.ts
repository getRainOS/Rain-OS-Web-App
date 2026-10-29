// services/botVisits.ts — counts visits from AI crawlers on a customer's site.
// Crawlers announce themselves in the User-Agent header, so matching on it is
// reliable for the named bots. Visits from AI tools that fetch a page only when
// a person asks may not announce themselves, so these counts are a floor.
import { pool } from './db';

export const AI_BOTS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'ChatGPT', pattern: /GPTBot|ChatGPT-User|OAI-SearchBot/i },
  { name: 'Claude', pattern: /ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai/i },
  { name: 'Perplexity', pattern: /PerplexityBot|Perplexity-User/i },
  { name: 'Meta', pattern: /meta-externalagent|Meta-ExternalFetcher|FacebookBot/i },
  { name: 'Google AI', pattern: /Google-Extended|GoogleOther/i },
  { name: 'Apple', pattern: /Applebot-Extended/i },
  { name: 'Common Crawl', pattern: /CCBot/i },
];

// The bot's name for a User-Agent header, or null if it isn't an AI crawler.
export function classifyBot(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  const hit = AI_BOTS.find(b => b.pattern.test(userAgent));
  return hit ? hit.name : null;
}

export interface BotHit { bot: string; path: string }

const MAX_PATH = 300;
const cleanPath = (p: string) => p.split('?')[0].split('#')[0].slice(0, MAX_PATH) || '/';

// Adds today's hits to the daily totals, one row per site, bot and page.
export async function recordBotHits(userId: string, site: string, hits: BotHit[]): Promise<number> {
  const counts = new Map<string, { bot: string; path: string; n: number }>();
  for (const h of hits) {
    if (!AI_BOTS.some(b => b.name === h.bot)) continue;
    const path = cleanPath(h.path);
    const key = `${h.bot}\u0000${path}`;
    const c = counts.get(key) || { bot: h.bot, path, n: 0 };
    c.n += 1;
    counts.set(key, c);
  }
  for (const c of counts.values()) {
    await pool.query(
      `INSERT INTO bot_visits (user_id, site, day, bot, path, visits)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
       ON CONFLICT (user_id, site, day, bot, path)
       DO UPDATE SET visits = bot_visits.visits + EXCLUDED.visits`,
      [userId, site.toLowerCase().slice(0, 253), c.bot, c.path, c.n]
    );
  }
  return [...counts.values()].reduce((sum, c) => sum + c.n, 0);
}

export interface BotSummary {
  total: number;
  byBot: Array<{ bot: string; visits: number }>;
  topPages: Array<{ path: string; visits: number }>;
  days: Array<{ day: string; visits: number }>;
}

// Totals for the last N days, for the dashboard card.
export async function summarizeBotVisits(userId: string, days = 7): Promise<BotSummary> {
  const [bots, pages, perDay] = await Promise.all([
    pool.query(
      `SELECT bot, SUM(visits)::int AS visits FROM bot_visits
       WHERE user_id = $1 AND day > CURRENT_DATE - $2::int GROUP BY bot ORDER BY visits DESC`,
      [userId, days]),
    pool.query(
      `SELECT path, SUM(visits)::int AS visits FROM bot_visits
       WHERE user_id = $1 AND day > CURRENT_DATE - $2::int GROUP BY path ORDER BY visits DESC LIMIT 5`,
      [userId, days]),
    pool.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, SUM(visits)::int AS visits FROM bot_visits
       WHERE user_id = $1 AND day > CURRENT_DATE - $2::int GROUP BY day ORDER BY day`,
      [userId, days]),
  ]);
  const byBot = bots.rows.map(r => ({ bot: String(r.bot), visits: Number(r.visits) }));
  return {
    total: byBot.reduce((s, b) => s + b.visits, 0),
    byBot,
    topPages: pages.rows.map(r => ({ path: String(r.path), visits: Number(r.visits) })),
    days: perDay.rows.map(r => ({ day: String(r.day), visits: Number(r.visits) })),
  };
}
