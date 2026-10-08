// api/citation-regions.ts — POST /api/citation-checks/regions
// Resolve a list of competitor domains to their likely HQ country for the
// Citation Monitor's world map. Cache-backed; does not count as a usage
// credit — this is a lookup against data the user already has, not a new
// scored analysis.
import express from 'express';
import { findUserByApiKey } from '../services/dbService';
import { resolveDomainCountries } from '../services/domainGeoService';
import type { ApiError } from '../types';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

export async function regionsHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const { domains } = req.body as { domains?: unknown };
  if (!Array.isArray(domains) || domains.some(d => typeof d !== 'string')) {
    return res.status(400).json({ error: 'bad_request', message: 'domains must be an array of strings' } as ApiError);
  }

  try {
    const resolved = await resolveDomainCountries(domains as string[]);
    const out: Record<string, { name: string; iso: string; flag: string } | null> = {};
    for (const [domain, country] of resolved) out[domain] = country;
    return res.status(200).json({ success: true, domains: out });
  } catch (error) {
    console.error('Domain region resolution error:', error);
    return res.status(502).json({ error: 'gemini_error', message: 'Could not resolve domain regions' } as ApiError);
  }
}
