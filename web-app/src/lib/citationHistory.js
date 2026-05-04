const STORAGE_PREFIX = 'rain_os_citation_history';
const MAX_ENTRIES = 50;

function storageKey(scope) {
  return `${STORAGE_PREFIX}:${scope || 'anon'}`;
}

function safeParse(raw) {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function loadCitationHistory(scope) {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(storageKey(scope)));
}

export function saveCitationCheck(scope, result) {
  if (typeof window === 'undefined' || !result || !result.topic) return [];
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    topic: result.topic,
    url: result.url || null,
    cited: !!result.cited,
    citedSourceIndex: result.citedSourceIndex ?? null,
    alignmentScore: result.alignmentScore ?? null,
    sources: (result.sources || []).map((s, i) => ({
      rank: i + 1,
      title: s.title || '',
      url: s.url || '',
      domain: s.domain || '',
    })),
    competitorDomains: result.competitorDomains || [],
  };
  const existing = loadCitationHistory(scope);
  const next = [entry, ...existing].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(storageKey(scope), JSON.stringify(next));
  } catch {
    /* quota — silently ignore */
  }
  return next;
}

export function clearCitationHistory(scope) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(storageKey(scope));
  } catch {
    /* ignore */
  }
}

function insightFor({ queryCount, totalQueries, avgRank, citedAsTop }) {
  const dominanceRatio = queryCount / Math.max(totalQueries, 1);
  if (dominanceRatio >= 0.6 && totalQueries >= 3) {
    return 'Dominant authority across your tracked topics — earning a guest post or editorial mention here is your highest-leverage citation play.';
  }
  if (citedAsTop && queryCount >= 2) {
    return 'Cited as a top-ranked source on multiple queries — AI engines treat this domain as a primary reference for your niche.';
  }
  if (queryCount >= 3) {
    return 'Recurring competitor across several of your queries — overlapping topical authority worth monitoring closely.';
  }
  if (avgRank <= 2) {
    return 'Cited near the top when it appears — high-trust source for this specific topic.';
  }
  if (queryCount >= 2) {
    return 'Appears across more than one of your queries — a secondary voice in your topic cluster.';
  }
  return 'Cited once so far — lower priority, but worth tracking as you add more checks.';
}

export function buildCompetitorMap(history, ownDomain) {
  const totalQueries = history.length;
  if (!totalQueries) return { totalQueries: 0, domains: [] };

  const ownNormalized = ownDomain ? ownDomain.toLowerCase().replace(/^www\./, '') : null;
  const byDomain = new Map();

  for (const entry of history) {
    const seenInQuery = new Set();
    const fallbackRank = (entry.sources?.length || 0) + 1;

    const upsert = (rawDomain, rank, url) => {
      const domain = (rawDomain || '').toLowerCase().replace(/^www\./, '');
      if (!domain) return;
      if (ownNormalized && domain === ownNormalized) return;
      if (seenInQuery.has(domain)) return;
      seenInQuery.add(domain);

      let agg = byDomain.get(domain);
      if (!agg) {
        agg = {
          domain,
          queryCount: 0,
          rankSum: 0,
          bestRank: Infinity,
          topics: [],
          sampleUrl: null,
        };
        byDomain.set(domain, agg);
      }
      agg.queryCount += 1;
      agg.rankSum += rank || 0;
      agg.bestRank = Math.min(agg.bestRank, rank || Infinity);
      if (entry.topic && !agg.topics.includes(entry.topic)) {
        agg.topics.push(entry.topic);
      }
      if (!agg.sampleUrl && url) agg.sampleUrl = url;
    };

    for (const src of entry.sources || []) {
      upsert(src.domain, src.rank, src.url);
    }
    // Fallback: use stored competitorDomains for any domain not surfaced via sources
    // (covers cases where the API returns competitor domains without full source rows).
    for (const dom of entry.competitorDomains || []) {
      upsert(dom, fallbackRank, null);
    }
  }

  const domains = Array.from(byDomain.values())
    .map(d => {
      const avgRank = d.rankSum / Math.max(d.queryCount, 1);
      return {
        domain: d.domain,
        queryCount: d.queryCount,
        coverage: d.queryCount / totalQueries,
        avgRank: Math.round(avgRank * 10) / 10,
        bestRank: d.bestRank === Infinity ? null : d.bestRank,
        topics: d.topics,
        sampleUrl: d.sampleUrl || `https://${d.domain}`,
        insight: insightFor({
          queryCount: d.queryCount,
          totalQueries,
          avgRank,
          citedAsTop: d.bestRank <= 2,
        }),
      };
    })
    .sort((a, b) => {
      if (b.queryCount !== a.queryCount) return b.queryCount - a.queryCount;
      return a.avgRank - b.avgRank;
    });

  return { totalQueries, domains };
}
