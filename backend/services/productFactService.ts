// services/productFactService.ts — saved product fact sheets.
import { pool } from './db';
import { cleanFacts, cleanDefaults, type ProductFacts, type StoreDefaults } from './productFacts';

export interface ProductFactSheet { id: number; facts: ProductFacts; updatedAt: string }

const map = (r: any): ProductFactSheet => ({
  id: Number(r.id),
  facts: cleanFacts(r.facts),
  updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
});

export async function listProductFacts(userId: string): Promise<ProductFactSheet[]> {
  const r = await pool.query(`SELECT * FROM product_facts WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 2000`, [userId]);
  return r.rows.map(map);
}

export async function getProductFacts(userId: string, id: number): Promise<ProductFactSheet | null> {
  const r = await pool.query(`SELECT * FROM product_facts WHERE id = $1 AND user_id = $2`, [id, userId]);
  return r.rows[0] ? map(r.rows[0]) : null;
}

export async function saveProductFacts(userId: string, facts: ProductFacts, id?: number | null): Promise<ProductFactSheet | null> {
  const r = id
    ? await pool.query(`UPDATE product_facts SET name = $3, facts = $4::jsonb, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId, facts.name, JSON.stringify(facts)])
    : await pool.query(`INSERT INTO product_facts (user_id, name, facts) VALUES ($1, $2, $3::jsonb) RETURNING *`,
      [userId, facts.name, JSON.stringify(facts)]);
  return r.rows[0] ? map(r.rows[0]) : null;
}

export async function deleteProductFacts(userId: string, id: number): Promise<boolean> {
  const r = await pool.query(`DELETE FROM product_facts WHERE id = $1 AND user_id = $2`, [id, userId]);
  return (r.rowCount || 0) > 0;
}

export async function getStoreDefaults(userId: string): Promise<StoreDefaults> {
  const r = await pool.query(`SELECT defaults FROM product_defaults WHERE user_id = $1`, [userId]);
  return cleanDefaults(r.rows[0]?.defaults);
}

export async function saveStoreDefaults(userId: string, d: StoreDefaults): Promise<StoreDefaults> {
  await pool.query(
    `INSERT INTO product_defaults (user_id, defaults) VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET defaults = EXCLUDED.defaults, updated_at = NOW()`,
    [userId, JSON.stringify(d)]
  );
  return d;
}

// Fields an import owns. Re-importing refreshes these and never touches what
// the owner wrote (best for, comparison, shipping, reviews...).
const IMPORTED: Array<keyof ProductFacts> = ['name', 'brand', 'url', 'image', 'sku', 'gtin', 'mpn', 'price', 'currency', 'salePrice', 'variants', 'sourceText'];

export function mergeImported(existing: ProductFacts, incoming: ProductFacts): ProductFacts {
  const out: any = { ...existing };
  for (const k of IMPORTED) {
    const v: any = (incoming as any)[k];
    if (Array.isArray(v) ? v.length : v) out[k] = v;
  }
  // Fill blanks the import happens to know (e.g. rating from page data).
  for (const [k, v] of Object.entries(incoming)) if (!IMPORTED.includes(k as any) && !out[k] && v && !(Array.isArray(v) && !v.length)) out[k] = v;
  return cleanFacts(out);
}

// Save many imported products: update the sheet with the same product URL,
// otherwise create one. Returns how many were created and updated.
export async function upsertImported(userId: string, incoming: ProductFacts[]): Promise<{ created: number; updated: number }> {
  const existing = await listProductFacts(userId);
  const byUrl = new Map(existing.filter(e => e.facts.url).map(e => [e.facts.url.replace(/\/$/, '').toLowerCase(), e]));
  let created = 0, updated = 0;
  for (const f of incoming) {
    const match = f.url ? byUrl.get(f.url.replace(/\/$/, '').toLowerCase()) : undefined;
    if (match) { await saveProductFacts(userId, mergeImported(match.facts, f), match.id); updated++; }
    else { await saveProductFacts(userId, f, null); created++; }
  }
  return { created, updated };
}
