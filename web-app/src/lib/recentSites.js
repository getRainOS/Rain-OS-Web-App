import { api } from '../api/client.js';
import { getMySite } from './mySite.js';
import { domainOf } from './opportunities.js';

// Websites and pages the user has already worked with, newest first, pulled
// from their saved analyses and citation checks. Loaded once per session.
let cache = null;
let cachedAt = 0;
const TTL_MS = 60 * 1000;

export async function loadRecent() {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  const list = r => (Array.isArray(r.data) ? r.data : Array.isArray(r.data?.data) ? r.data.data : r.data?.items ?? []);
  const [hist, cites, brandRows, sovRows, tracked] = await Promise.all([
    api.history({ limit: 50 }).then(r => (Array.isArray(r.data) ? r.data : r.data?.items ?? [])).catch(() => []),
    api.citationHistory({ limit: 50 }).then(r => (Array.isArray(r.data) ? r.data : r.data?.items ?? [])).catch(() => []),
    api.brandVisHistory().then(list).catch(() => []),
    api.sovHistory().then(list).catch(() => []),
    api.trackedQueries().then(r => r.data?.items ?? []).catch(() => []),
  ]);
  const stamp = x => new Date(x.checkedAt || x.checked_at || x.created_at || x.analyzed_at || 0).getTime();
  const distinct = (rows, pick) => {
    const seen = new Set();
    const out = [];
    for (const row of [...rows].sort((a, b) => stamp(b) - stamp(a))) {
      const v = (pick(row) || '').trim();
      const k = v.toLowerCase().replace(/\s+/g, ' ');
      if (v && !seen.has(k)) { seen.add(k); out.push(v); }
    }
    return out;
  };
  const brands = distinct([...brandRows, ...sovRows], r => r.brand);
  const questions = distinct([...cites, ...brandRows, ...sovRows, ...tracked], r => r.topic);
  const when = x => new Date(x.analyzed_at || x.checkedAt || x.checked_at || 0).getTime();
  const rows = [
    ...hist.filter(h => h.url && !h.repo).map(h => ({ url: h.url, at: when(h) })),
    ...cites.filter(c => c.url).map(c => ({ url: c.url, at: when(c) })),
  ].sort((a, b) => b.at - a.at);
  const pages = [];
  const sites = [];
  const seenPage = new Set();
  const seenSite = new Set();
  const own = getMySite();
  if (own && domainOf(own)) { sites.push(domainOf(own)); seenSite.add(domainOf(own)); }
  for (const r of rows) {
    const clean = r.url.trim().replace(/\/+$/, '');
    if (!seenPage.has(clean.toLowerCase())) { seenPage.add(clean.toLowerCase()); pages.push(clean); }
    const d = domainOf(r.url);
    if (d && !seenSite.has(d)) { seenSite.add(d); sites.push(d); }
  }
  cache = { pages: pages.slice(0, 12), sites: sites.slice(0, 12), brands: brands.slice(0, 12), questions: questions.slice(0, 15) };
  cachedAt = Date.now();
  return cache;
}

export function clearRecentCache() { cache = null; }
