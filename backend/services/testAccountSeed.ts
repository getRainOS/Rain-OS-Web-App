// services/testAccountSeed.ts — staff tool: reset the test account
// (the staff account support@getrainos.com only) to Bright Smile Dental plus a realistic set of
// real public sites per lane, each analyzed for real through URL Scanner, so
// every tool can be tried on brands AI actually knows.
import { pool } from './db';
import { findUserByEmail } from './dbService';

export const TEST_EMAIL = 'support@getrainos.com';

// Real, public sites of the kind each lane is built for.
export type SeedKind = 'url' | 'content' | 'repo';
export type Seed = { lane: string; url: string; brand: string; kind?: SeedKind; title?: string; contentType?: string; content?: string; state?: string; platform?: string };
export const SEEDS: Seed[] = [
  // Local Service Business: independent local shops and restaurants
  { lane: 'local_business', url: 'https://franklinbbq.com', brand: 'Franklin Barbecue', state: 'TX' },
  { lane: 'local_business', url: 'https://www.joespizzanyc.com', brand: "Joe's Pizza", state: 'NY' },
  { lane: 'local_business', url: 'https://www.voodoodoughnut.com', brand: 'Voodoo Doughnut', state: 'OR' },
  { lane: 'local_business', url: 'https://tartinebakery.com', brand: 'Tartine Bakery', state: 'CA' },
  // Local service businesses outside the big coastal cities
  { lane: 'local_business', url: 'https://www.yoderplumbing.com', brand: 'Yoder Plumbing', state: 'OH' },
  { lane: 'local_business', url: 'https://www.kryderlaw.com', brand: 'The Kryder Law Group', state: 'IL' },
  { lane: 'local_business', url: 'https://ugclimbing.com', brand: 'Übergrippen', state: 'CO' },
  // Product Sellers: independent brand stores (likely Shopify, not verified)
  { lane: 'product_sellers', url: 'https://ugmonk.com', brand: 'Ugmonk' },
  { lane: 'product_sellers', url: 'https://fellowproducts.com', brand: 'Fellow' },
  { lane: 'product_sellers', url: 'https://www.manduka.com', brand: 'Manduka' },
  { lane: 'product_sellers', url: 'https://bellroy.com', brand: 'Bellroy' },
  // ...and stores on other platforms
  { lane: 'product_sellers', url: 'https://nalgene.com', brand: 'Nalgene', platform: 'WooCommerce' },
  { lane: 'product_sellers', url: 'https://www.skullcandy.com', brand: 'Skullcandy', platform: 'BigCommerce' },
  { lane: 'product_sellers', url: 'https://www.blacksheepbikes.com', brand: 'Black Sheep Bikes', platform: 'Wix', state: 'CO' },
  { lane: 'product_sellers', url: 'https://www.washiarts.com', brand: 'Washi Arts', platform: 'Squarespace' },
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

  // Pasted content (Content Optimizer): short drafts of the kind each lane writes.
  { lane: 'local_business', kind: 'content', url: 'content:franklin-faq', brand: 'Franklin Barbecue', state: 'TX', contentType: 'blog_post', title: 'How to plan a visit to Franklin Barbecue',
    content: 'Planning a trip to Franklin Barbecue in Austin? Most people line up early because brisket sells out. Bring a chair, water and some patience. The line moves steadily once the doors open, and staff walk the line to let people know when food is likely to run out. If you would rather skip the wait, look at the pre-order option on the website, which needs to be placed well ahead of time. Parking nearby fills up, so arriving on foot or by rideshare is easier.' },
  { lane: 'product_sellers', kind: 'content', url: 'content:bellroy-wallet', brand: 'Bellroy', contentType: 'product_description', title: 'Slim leather wallet',
    content: 'A slim leather wallet that holds your everyday cards and a few folded notes without the bulk. A pull tab brings less-used cards up from the bottom, and a quick-access slot keeps your most used card at the front. Made from leather that softens with use. Fits easily in a front pocket.' },
  { lane: 'vibe_coders', kind: 'content', url: 'content:photoai-launch', brand: 'Photo AI', contentType: 'social_post', title: 'Launch post',
    content: 'Just shipped a new update to Photo AI 📸 You can now pick a style, upload a few selfies and get a full set of professional-looking photos in minutes. No studio, no photographer. Built it solo and it keeps growing every week. Try it and tell me what you think 👇 #buildinpublic #indiehackers' },
  { lane: 'developers', kind: 'content', url: 'content:hono-quickstart', brand: 'Hono', contentType: 'documentation', title: 'Hono quick start',
    content: 'Hono is a small, fast web framework built on Web Standards. It runs on Cloudflare Workers, Deno, Bun, Node.js and more. To start a project, run npm create hono@latest and pick your runtime. Define a route with app.get(\'/\', (c) => c.text(\'Hello Hono!\')). Middleware is added with app.use(). Hono includes helpers for JSON responses, validation and routing groups.' },
  { lane: 'general', kind: 'content', url: 'content:wbw-procrastination', brand: 'Wait But Why', contentType: 'article', title: 'Why we procrastinate',
    content: 'Most procrastinators know exactly what they should be doing. The problem is not knowledge, it is the moment of choice. In that moment, the easy, fun option wins over the important one again and again. Deadlines help because they bring panic, and panic overrides the pull of distraction. But a lot of important work in life has no deadline at all, and that is where procrastination does the most damage.' },

  // GitHub repos (needs GitHub connected on the test account).
  { lane: 'developers', kind: 'repo', url: 'https://github.com/bigskysoftware/htmx', brand: 'htmx' },
  { lane: 'developers', kind: 'repo', url: 'https://github.com/pocketbase/pocketbase', brand: 'PocketBase' },
  { lane: 'vibe_coders', kind: 'repo', url: 'https://github.com/honojs/hono', brand: 'Hono' },
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
  return { email: TEST_EMAIL, counts, seeds: SEEDS.map(({ content, ...s }) => s) };
}

// ─── Running a reset ──────────────────────────────────────────────────────────
type SeedStatus = Seed & { status: 'waiting' | 'running' | 'done' | 'failed'; score?: number | null; error?: string };
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
  job.seeds = SEEDS.map(s => ({ ...s, status: 'waiting' as const }));

  // Seed in the background: a real URL Scanner analysis per site, through the
  // normal API as the test account, one at a time (gentle on the Gemini quota).
  (async () => {
    for (const s of job.seeds) {
      s.status = 'running';
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const [path, body] = s.kind === 'content'
            ? ['/api/analyze', { content: s.content, title: s.title, contentType: s.contentType, module: s.lane, brand: s.brand, state: s.state }]
            : s.kind === 'repo'
              ? ['/api/github/analyze', { repoUrl: s.url, module: s.lane }]
              : ['/api/url-scan', { url: s.url, module: s.lane, brand: s.brand, state: s.state }];
          const res = await fetch(`http://127.0.0.1:${port}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'X-Rain-Lane': s.lane },
            body: JSON.stringify(body),
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
