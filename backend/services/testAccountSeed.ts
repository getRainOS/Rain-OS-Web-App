// services/testAccountSeed.ts — staff tool: reset the test account
// (test08@getrainos.com only) to Bright Smile Dental plus a realistic set of
// real public sites per lane, each analyzed for real through URL Scanner, so
// every tool can be tried on brands AI actually knows.
import { pool } from './db';
import { findUserByEmail } from './dbService';

export const TEST_EMAIL = 'test08@getrainos.com';

// Real, public sites of the kind each lane is built for.
export const SEEDS: Array<{ lane: string; url: string; brand: string }> = [
  // Local Service Business: independent local shops and restaurants
  { lane: 'local_business', url: 'https://franklinbbq.com', brand: 'Franklin Barbecue' },
  { lane: 'local_business', url: 'https://www.joespizzanyc.com', brand: "Joe's Pizza" },
  { lane: 'local_business', url: 'https://www.voodoodoughnut.com', brand: 'Voodoo Doughnut' },
  { lane: 'local_business', url: 'https://tartinebakery.com', brand: 'Tartine Bakery' },
  // Product Sellers: independent online stores
  { lane: 'product_sellers', url: 'https://ugmonk.com', brand: 'Ugmonk' },
  { lane: 'product_sellers', url: 'https://fellowproducts.com', brand: 'Fellow' },
  { lane: 'product_sellers', url: 'https://www.manduka.com', brand: 'Manduka' },
  { lane: 'product_sellers', url: 'https://bellroy.com', brand: 'Bellroy' },
  // Vibe Coders: small AI apps and no-code sites built fast by solo makers
  { lane: 'vibe_coders', url: 'https://photoai.com', brand: 'Photo AI' },
  { lane: 'vibe_coders', url: 'https://interiorai.com', brand: 'Interior AI' },
  { lane: 'vibe_coders', url: 'https://carrd.co', brand: 'Carrd' },
  // Developers: indie open-source projects and their docs
  { lane: 'developers', url: 'https://htmx.org/docs/', brand: 'htmx' },
  { lane: 'developers', url: 'https://hono.dev/docs/', brand: 'Hono' },
  { lane: 'developers', url: 'https://pocketbase.io/docs/', brand: 'PocketBase' },
  // Writers & Marketers: independent publications and blogs
  { lane: 'general', url: 'https://longreads.com', brand: 'Longreads' },
  { lane: 'general', url: 'https://waitbutwhy.com', brand: 'Wait But Why' },
  { lane: 'general', url: 'https://seths.blog', brand: "Seth's Blog" },
];

// Bright Smile Dental is kept everywhere.
const KEEP_ANALYSIS = `(url ILIKE '%brightsmiledental%' OR title ILIKE '%bright smile%' OR result_json->>'brand' ILIKE 'bright smile%')`;
const KEEP_CHECK = `(url ILIKE '%brightsmiledental%' OR brand ILIKE 'bright smile%')`;
const KEEP_CITATION = `(url ILIKE '%brightsmiledental%' OR brand ILIKE 'bright smile%' OR name ILIKE '%bright smile%')`;
// Each keep-rule is wrapped in COALESCE: an empty url, brand or title makes
// ILIKE return NULL, and "NOT NULL" would then neither delete nor keep the row.
const sure = (cond: string) => `COALESCE(${cond}, false)`;
export const TABLES: Array<[string, string]> = [
  ['content_analyses', sure(KEEP_ANALYSIS)],
  ['citation_checks', sure(KEEP_CITATION)],
  ['brand_visibility_checks', sure(KEEP_CHECK)],
  ['sov_checks', sure(KEEP_CHECK)],
  ['tracked_queries', sure(KEEP_CHECK)],
  ['brand_site_links', sure(`(site ILIKE '%brightsmiledental%' OR brand ILIKE 'bright smile%')`)],
];

async function testUser() {
  const user = await findUserByEmail(TEST_EMAIL);
  if (!user) throw new Error(`${TEST_EMAIL} was not found.`);
  return user;
}

export async function previewReset() {
  const user = await testUser();
  const counts: Array<{ table: string; remove: number; keep: number }> = [];
  for (const [table, keep] of TABLES) {
    const r = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE NOT ${keep})::int AS remove, COUNT(*) FILTER (WHERE ${keep})::int AS keep FROM ${table} WHERE user_id = $1`,
      [user.id]
    );
    counts.push({ table, remove: r.rows[0].remove, keep: r.rows[0].keep });
  }
  return { email: TEST_EMAIL, counts, seeds: SEEDS };
}

// ─── Running a reset ──────────────────────────────────────────────────────────
type SeedStatus = { url: string; brand: string; lane: string; status: 'waiting' | 'running' | 'done' | 'failed'; score?: number | null; error?: string };
export const job: { running: boolean; startedAt: string | null; deleted: Record<string, number>; seeds: SeedStatus[] } = {
  running: false, startedAt: null, deleted: {}, seeds: [],
};

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function startReset(port: number | string): Promise<void> {
  if (job.running) throw new Error('A reset is already running.');
  const user = await testUser();
  const apiKey = (user as any).apiKey as string | undefined;
  if (!apiKey) throw new Error('Could not read the test account key.');

  // Clean out, all or nothing.
  const client = await pool.connect();
  const deleted: Record<string, number> = {};
  try {
    await client.query('BEGIN');
    for (const [table, keep] of TABLES) {
      const r = await client.query(`DELETE FROM ${table} WHERE user_id = $1 AND NOT ${keep}`, [user.id]);
      deleted[table] = r.rowCount || 0;
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  job.running = true;
  job.startedAt = new Date().toISOString();
  job.deleted = deleted;
  job.seeds = SEEDS.map(s => ({ ...s, status: 'waiting' }));

  // Seed in the background: a real URL Scanner analysis per site, through the
  // normal API as the test account, one at a time (gentle on the Gemini quota).
  (async () => {
    for (const s of job.seeds) {
      s.status = 'running';
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(`http://127.0.0.1:${port}/api/url-scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'X-Rain-Lane': s.lane },
            body: JSON.stringify({ url: s.url, module: s.lane, brand: s.brand }),
          });
          const json: any = await res.json().catch(() => ({}));
          if (res.ok) { s.status = 'done'; s.score = json?.overallScore ?? json?.data?.overallScore ?? null; s.error = undefined; break; }
          s.status = 'failed';
          s.error = json?.message || `HTTP ${res.status}`;
          if (res.status !== 429 && res.status < 500) break; // not worth retrying
          await wait(30000 * (attempt + 1));
        } catch (err: any) {
          s.status = 'failed';
          s.error = err?.message || 'Request failed';
          await wait(15000);
        }
      }
      await wait(8000);
    }
    job.running = false;
  })().catch(() => { job.running = false; });
}
