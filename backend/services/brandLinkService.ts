// brandLinkService.ts — links a brand name to one of the user's websites.
import { pool } from './db';
import { brandKey } from './brandLinkKeys';

export interface BrandLink { brand: string; site: string }

export async function listBrandLinks(userId: string): Promise<BrandLink[]> {
  const res = await pool.query(
    'SELECT brand, site FROM brand_site_links WHERE user_id = $1 ORDER BY created_at',
    [userId]
  );
  return res.rows;
}

export async function saveBrandLink(userId: string, brand: string, site: string): Promise<void> {
  await pool.query(
    `INSERT INTO brand_site_links (user_id, brand_key, brand, site) VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, brand_key, site) DO UPDATE SET brand = EXCLUDED.brand`,
    [userId, brandKey(brand), brand, site]
  );
}

export async function deleteBrandLink(userId: string, brand: string, site: string): Promise<void> {
  await pool.query('DELETE FROM brand_site_links WHERE user_id = $1 AND brand_key = $2 AND site = $3', [userId, brandKey(brand), site]);
}
