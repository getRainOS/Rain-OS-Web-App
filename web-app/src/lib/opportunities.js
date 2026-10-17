// Turns what rain OS already knows (citation checks, URL scans) into one
// prioritized to-do list. Pure and synchronous so it is easy to test.
import { sourceTypeOf } from './sourceTypes.js';

const topicKey = t => (t || '').trim().toLowerCase().replace(/\s+/g, ' ');
const when = e => new Date(e.checkedAt || e.checked_at || e.analyzed_at || 0).getTime();

export function domainOf(input) {
  if (!input) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function sourceDomain(src) {
  return domainOf(src?.domain || src?.uri || src?.url || '');
}

function ownRank(entry) {
  const own = domainOf(entry.url);
  if (!own) return null;
  const idx = (entry.sources || []).findIndex(s => {
    const d = sourceDomain(s);
    return d && (d === own || d.endsWith(`.${own}`));
  });
  return idx >= 0 ? idx + 1 : null;
}

const SCAN_THRESHOLD = 60;
const SITE_TYPES = new Set(['forums', 'reviews']);

export function buildOpportunities({ checks = [], scans = [] }) {
  const out = [];

  // Latest check per question.
  const latest = new Map();
  for (const c of checks) {
    const k = topicKey(c.topic);
    if (!k) continue;
    if (!latest.has(k) || when(c) > when(latest.get(k))) latest.set(k, c);
  }

  for (const c of latest.values()) {
    const sources = c.sources || [];
    const leader = sources.map(sourceDomain).find(Boolean);
    const rank = ownRank(c);
    const cited = rank != null || c.cited === true;
    if (!cited) {
      out.push({
        id: `uncited:${topicKey(c.topic)}`,
        priority: 'high',
        kind: 'uncited',
        question: c.topic,
        url: c.url || '',
        title: 'AI doesn’t cite you for this question',
        detail: leader
          ? `Gemini cited ${sources.length} source${sources.length !== 1 ? 's' : ''}, led by ${leader}. A page that answers the question directly gives it a reason to cite you.`
          : 'A page that answers the question directly gives Gemini a reason to cite you.',
      });
    } else if (rank && rank > 3) {
      out.push({
        id: `lowrank:${topicKey(c.topic)}`,
        priority: 'medium',
        kind: 'lowrank',
        question: c.topic,
        url: c.url || '',
        rank,
        title: `You’re cited, but at #${rank}`,
        detail: `${leader || 'Another site'} is cited first. Answering the question in your first paragraph and adding specifics (prices, numbers, steps) helps you move up.`,
      });
    }
  }

  // Forums and review sites AI keeps citing across all questions.
  const siteCounts = new Map();
  for (const c of latest.values()) {
    const seen = new Set();
    for (const s of c.sources || []) {
      const d = sourceDomain(s);
      if (!d || seen.has(d)) continue;
      seen.add(d);
      const type = sourceTypeOf(d);
      if (!SITE_TYPES.has(type.id)) continue;
      const cur = siteCounts.get(d) || { domain: d, type, count: 0, uri: s.uri || s.url || `https://${d}` };
      cur.count += 1;
      siteCounts.set(d, cur);
    }
  }
  const sites = [...siteCounts.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  for (const s of sites) {
    out.push({
      id: `site:${s.domain}`,
      priority: s.count > 1 ? 'medium' : 'low',
      kind: 'site',
      domain: s.domain,
      href: s.uri,
      title: s.type.id === 'reviews' ? `Get listed and reviewed on ${s.domain}` : `Join the conversation on ${s.domain}`,
      detail: `Gemini cited ${s.domain} for ${s.count} of your question${s.count !== 1 ? 's' : ''}. ${s.type.action}`,
    });
  }

  // Latest scan per page that scores low. People also scan competitors'
  // pages, so once we know their own domains (from checks) only those count.
  const ownDomains = new Set([...latest.values()].map(c => domainOf(c.url)).filter(Boolean));
  const latestScan = new Map();
  for (const s of scans) {
    if (!s.url) continue;
    if (ownDomains.size && !ownDomains.has(domainOf(s.url))) continue;
    const k = s.url.replace(/\/$/, '');
    if (!latestScan.has(k) || when(s) > when(latestScan.get(k))) latestScan.set(k, s);
  }
  const lowScans = [];
  for (const s of latestScan.values()) {
    const score = Math.round(Number(s.overall_score ?? s.overallScore));
    if (!Number.isFinite(score) || score >= SCAN_THRESHOLD) continue;
    lowScans.push({
      id: `scan:${s.url}`,
      priority: score < 40 ? 'high' : 'medium',
      kind: 'scan',
      url: s.url,
      score,
      title: `This page scores ${score}/100 for AI readability`,
      detail: 'Rescan it to see the specific fixes, with plain-English steps and code where it helps.',
    });
  }
  out.push(...lowScans.sort((a, b) => a.score - b.score).slice(0, 3));

  const order = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => order[a.priority] - order[b.priority]);
}
