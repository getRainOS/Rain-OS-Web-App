// services/productFactService.ts — saved product fact sheets.
import { pool } from './db';
import { cleanFacts, type ProductFacts } from './productFacts';

export interface ProductFactSheet { id: number; facts: ProductFacts; updatedAt: string }

const map = (r: any): ProductFactSheet => ({
  id: Number(r.id),
  facts: cleanFacts(r.facts),
  updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
});

export async function listProductFacts(userId: string): Promise<ProductFactSheet[]> {
  const r = await pool.query(`SELECT * FROM product_facts WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 500`, [userId]);
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
