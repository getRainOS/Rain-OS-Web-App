// api/maps-grid.ts — POST /api/maps-grid
// Where the business shows up on Google Maps across its area (services/
// mapsGrid.ts). Paid plans, a few grids a day (each point is one DataForSEO
// search), and only once DataForSEO is switched on and verified.
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { runMapsGrid, GRID_SIZES } from '../services/mapsGrid';
import { isPaidPlan } from '../services/planLimits';
import { EngineError } from '../services/engines/engineError';
import { createDailyLimiter } from '../services/dailyLimiter';
import { US_STATE_NAMES } from '../services/engines/location';
import { listingsAvailable } from './local-listing';
import type { ApiError } from '../types';

const takeSlot = createDailyLimiter(3);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function mapsGridHandler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  if (!listingsAvailable()) return res.status(503).json({ error: 'engine_unavailable', message: 'The Google Maps map is not available yet.' } as ApiError);
  if (!isPaidPlan(user)) return res.status(402).json({ error: 'plan_required', message: 'The Google Maps map is on Pro and Business plans.' } as ApiError);

  const businessName = str(req.body?.businessName, 120);
  const city = str(req.body?.city, 80);
  const service = str(req.body?.service, 80);
  const stateRaw = str(req.body?.state, 2).toUpperCase();
  const state = US_STATE_NAMES[stateRaw] ? stateRaw : null;
  if (businessName.length < 2 || city.length < 2 || service.length < 2) {
    return res.status(400).json({ error: 'bad_request', message: 'Business name, city and the service customers search for are required.' } as ApiError);
  }
  const size = (GRID_SIZES as readonly number[]).includes(Number(req.body?.size)) ? Number(req.body.size) : undefined;
  const url = str(req.body?.url, 300) || null;

  if (!takeSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have run 3 Google Maps maps today. Try again tomorrow.' } as ApiError);
  }
  try {
    const data = await runMapsGrid({ businessName, city, state, service, url, size });
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    if (err instanceof EngineError) return res.status(err.status).json({ error: err.code || 'engine_error', message: err.message } as ApiError);
    if (err?.status === 422) return res.status(422).json({ error: 'not_found', message: err.message } as ApiError);
    console.error('Maps grid failed:', err);
    return res.status(500).json({ error: 'internal_error', message: 'The Google Maps map failed. Please try again.' } as ApiError);
  }
}
