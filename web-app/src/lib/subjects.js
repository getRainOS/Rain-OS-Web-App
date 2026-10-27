// The things you've analyzed, as the only choices in the monitoring tools.
// A subject is a website (URL Scanner, or content analyzed with a URL), a
// pasted piece of content without a website, or a repo. Citation Monitor,
// Brand Sentiment, Share of Voice, Full Check and the dashboard all pick one,
// and every check saves its key, so analysis and monitoring always line up.
import { domainOf } from './opportunities.js';
import { groupPieces, pieceName } from './analysisSeries.js';

const squash = t => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// With no brand name given, the site's page titles usually start with it:
// "Bright Smile Dental — Invisalign in Austin" → "Bright Smile Dental".
function nameFromTitles(titles) {
  const counts = new Map();
  for (const t of titles) {
    const head = String(t || '').split(/\s+[—–|·-]\s+|:\s+/)[0].trim();
    if (head.length >= 2 && head.length <= 60) counts.set(head, (counts.get(head) || 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best && (best[1] > 1 || counts.size === 1) ? best[0] : null;
}
const time = h => new Date(h.analyzed_at || 0).getTime();

// lane: only what was analyzed in that lane, so a blog post from the Writers
// lane doesn't show up as a choice for an online store.
export function buildSubjects(history, lane) {
  const all = Array.isArray(history) ? history : [];
  const items = lane ? all.filter(h => !h.lane || h.lane === lane) : all;
  const sites = new Map();
  for (const h of [...items].sort((a, b) => time(b) - time(a))) {
    if (h.repo || !h.url) continue;
    const site = domainOf(h.url);
    if (!site) continue;
    const s = sites.get(site) || { key: `site:${site}`, type: 'site', website: site, brand: null, latestId: h.id, at: time(h), count: 0, titles: [] };
    s.count += 1;
    s.titles.push(h.title);
    if (!s.brand && h.brand) s.brand = h.brand;
    if (!s.state && h.state) s.state = h.state;
    sites.set(site, s);
  }
  const out = [...sites.values()].map(({ titles, ...s }) => {
    const brand = s.brand || nameFromTitles(titles);
    return { ...s, brand, name: brand || s.website };
  });
  for (const p of groupPieces(items.filter(h => !h.url || h.repo))) {
    if (p.name === 'Untitled') continue;
    const repo = p.latest.repo;
    const brand = [...p.runs].reverse().find(r => r.brand)?.brand || null;
    out.push({
      key: repo ? `repo:${repo.replace(/^https?:\/\/(www\.)?github\.com\//, '')}` : `piece:${p.latest.series_id ?? p.latest.id}`,
      type: repo ? 'repo' : 'content',
      name: repo ? pieceName(p.latest) : p.name,
      website: null, brand, latestId: p.latest.id, at: time(p.latest), count: p.runs.length,
    });
  }
  // lookFor: the name AI answers are searched for. A website's name, or the
  // brand given for a piece of content (a title isn't something AI names).
  return out.map(s => ({ ...s, lookFor: s.brand || (s.type === 'site' ? s.name : null) })).sort((a, b) => b.at - a.at);
}

// A short description for the picker.
export function subjectHint(s) {
  if (s.type === 'site') return `Website${s.brand ? ` · ${s.website}` : ''} · ${s.count} ${s.count === 1 ? 'analysis' : 'analyses'}`;
  if (s.type === 'repo') return `Repo · ${s.count} ${s.count === 1 ? 'analysis' : 'analyses'}`;
  return `Content${s.brand ? ` · ${s.brand}` : ''} · ${s.count} ${s.count === 1 ? 'analysis' : 'analyses'}`;
}

// Does a saved check belong to this subject? Checks saved with a subject key
// match exactly; older checks (from before subjects) match by website or name.
export function checkBelongs(check, s) {
  if (!check || !s) return false;
  if (check.subject) return check.subject === s.key;
  if (s.website && domainOf(check.url) === s.website) return true;
  return !!check.brand && (squash(check.brand) === squash(s.name) || (!!s.brand && squash(check.brand) === squash(s.brand)));
}

// Remember the chosen subject across the monitoring pages and the dashboard.
const KEY = 'rain_os_subject';
export const getSubjectKey = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setSubjectKey = k => { try { localStorage.setItem(KEY, k || ''); } catch { /* not remembered */ } };
