// services/lanes.ts — the lane (Writers & Marketers, Product Sellers, …) a
// request was made from. The app sends it as X-Rain-Lane on every call, so
// each check is saved with the lane it was run in.
import type express from 'express';

export const LANES = ['general', 'product_sellers', 'vibe_coders', 'developers', 'local_business'] as const;

export function laneOf(req: express.Request): string | null {
  const v = req.headers['x-rain-lane'];
  const lane = (Array.isArray(v) ? v[0] : v || '').trim();
  return (LANES as readonly string[]).includes(lane) ? lane : null;
}
