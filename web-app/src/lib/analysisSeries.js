// Groups analyses into "pieces" so the dashboard trends one piece at a time.
// Repos group by repo, URL scans by URL, and pasted content by its
// re-analysis chain (series_id). Pasted content without a chain is its own
// piece.

const normUrl = u => (u || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

export function pieceKey(h) {
  if (h.repo) return `repo:${h.repo}`;
  if (h.series_id != null) return `series:${h.series_id}`;
  if (h.url) return `url:${normUrl(h.url)}`;
  return `series:${h.id}`;
}

export function pieceName(h) {
  if (h.title && h.title.trim()) return h.title.trim();
  if (h.repo) return h.repo.replace(/^https?:\/\/(www\.)?github\.com\//, '');
  if (h.url) return h.url.replace(/^https?:\/\/(www\.)?/, '');
  return 'Untitled';
}

const time = h => new Date(h.analyzed_at || 0).getTime();

// items: analyses (any order). Returns pieces sorted by most recent run,
// each with runs oldest → newest.
export function groupPieces(items) {
  const map = new Map();
  for (const h of items) {
    const k = pieceKey(h);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(h);
  }
  return [...map.entries()]
    .map(([key, runs]) => {
      const sorted = [...runs].sort((a, b) => time(a) - time(b));
      const latest = sorted[sorted.length - 1];
      return { key, runs: sorted, latest, name: pieceName(latest) };
    })
    .sort((a, b) => time(b.latest) - time(a.latest));
}
