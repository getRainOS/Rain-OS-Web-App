// Cross-topic competitor map aggregation. Operates on backend-shaped citation
// history records (see GET /api/citation-checks). Each entry should have:
//   { topic, url, sources: [{ domain, url, rank? }], competitorDomains? }
// `rank` is optional — when missing we use 1-based position in the sources array.

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
    const sources = entry.sources || [];
    const fallbackRank = sources.length + 1;

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
      const effectiveRank = rank || fallbackRank;
      agg.queryCount += 1;
      agg.rankSum += effectiveRank;
      agg.bestRank = Math.min(agg.bestRank, effectiveRank);
      if (entry.topic && !agg.topics.includes(entry.topic)) {
        agg.topics.push(entry.topic);
      }
      if (!agg.sampleUrl && url) agg.sampleUrl = url;
    };

    sources.forEach((src, i) => {
      // Backend rows store sources without a `rank` field — derive it from
      // the array order (1-based) so older v0.5 localStorage entries with an
      // explicit `rank` still work too.
      upsert(src.domain, src.rank ?? (i + 1), src.url);
    });
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
