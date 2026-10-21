// api/local-listing.ts — POST /api/local-listing
// The business's Google listing: profile, reviews that mention the city, and
// Google Maps position (services/localListingService.ts). Paid plans, and only
// once DataForSEO is switched on and verified.
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { runListingCheck } from '../services/localListingService';
import { isPaidPlan } from '../services/planLimits';
import { EngineError } from '../services/engines/engineError';
import { createDailyLimiter } from '../services/dailyLimiter';
import { US_STATE_NAMES } from '../services/engines/location';
import type { ApiError } from '../types';

const takeSlot = createDailyLimiter(30);

export function listingsAvailable(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env.DATAFORSEO_LOGIN && !!env.DATAFORSEO_PASSWORD && env.DATAFORSEO_VERIFIED === 'true';
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  if (!listingsAvailable()) return res.status(503).json({ error: 'engine_unavailable', message: 'Google listing checks are not available yet.' } as ApiError);
  if (!isPaidPlan(user)) return res.status(402).json({ error: 'plan_required', message: 'Google listing checks are on Pro and Business plans.' } as ApiError);

  const businessName = str(req.body?.businessName, 120);
  const city = str(req.body?.city, 80);
  const stateRaw = str(req.body?.state, 2).toUpperCase();
  const state = US_STATE_NAMES[stateRaw] ? stateRaw : null;
  const service = str(req.body?.service, 80);
  if (businessName.length < 2 || city.length < 2) {
    return res.status(400).json({ error: 'bad_request', message: 'Business name and city are required.' } as ApiError);
  }
  let url: string | null = null;
  if (typeof req.body?.url === 'string' && req.body.url.trim()) {
    let c = req.body.url.trim();
    if (!/^https?:\/\//i.test(c)) c = 'https://' + c;
    try { new URL(c); url = c; } catch { /* ignore a bad url; it only feeds the website match */ }
  }
  const p = req.body?.page || {};
  const page = { name: str(p.name, 120) || businessName, phone: str(p.phone, 40), street: str(p.street, 160), url };

  if (!takeSlot(user.id)) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'You have run 30 listing checks today. Try again tomorrow.' } as ApiError);
  }
  try {
    const result = await runListingCheck({ businessName, city, state, service, page });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof EngineError) return res.status(err.status).json({ error: err.code || 'engine_error', message: err.message } as ApiError);
    console.error('Listing check failed:', err);
    return res.status(500).json({ error: 'internal_error', message: 'The listing check failed. Please try again.' } as ApiError);
  }
}
