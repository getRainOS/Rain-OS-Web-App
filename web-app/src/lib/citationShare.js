export const SHARE_COLORS = ['#00F0FF', '#39FF88', '#FF9D00', '#B026FF', '#FF2E9A', '#FFEE00'];
export const SHARE_OTHER_COLOR = 'var(--text-dim)';

export function buildCitationShare(result) {
  if (!result?.modelResults) return [];
  const ownDomain = result.url ? result.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase() : null;

  const counts = new Map();
  for (const m of result.modelResults) {
    for (const s of m.sources || []) {
      const domain = (s.domain || '').toLowerCase().replace(/^www\./, '');
      if (!domain) continue;
      counts.set(domain, (counts.get(domain) || 0) + 1);
    }
  }
  if (counts.size === 0) return [];

  const sorted = Array.from(counts.entries())
    .map(([domain, count]) => ({ domain, count, isOwn: domain === ownDomain }))
    .sort((a, b) => b.count - a.count || (a.isOwn ? -1 : 0));

  const TOP_N = 5;
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const total = sorted.reduce((s, d) => s + d.count, 0);

  const slices = top.map((d, i) => ({
    name: d.domain,
    value: d.count,
    pct: Math.round((d.count / total) * 100),
    color: d.isOwn ? SHARE_COLORS[0] : SHARE_COLORS[(i % (SHARE_COLORS.length - 1)) + 1],
    isOwn: d.isOwn,
  }));
  if (rest.length > 0) {
    const restCount = rest.reduce((s, d) => s + d.count, 0);
    slices.push({ name: `${rest.length} other site${rest.length > 1 ? 's' : ''}`, value: restCount, pct: Math.round((restCount / total) * 100), color: SHARE_OTHER_COLOR, isOwn: false });
  }
  return slices;
}
