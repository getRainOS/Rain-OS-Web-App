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

const normTitle = t => (t || '').trim().toLowerCase().replace(/\s+/g, ' ');

// Pasted content with the same title is the same piece, even when its
// re-analyses were not chained (for example it was analyzed again from
// scratch). Runs sharing a chain id also stay together, so renaming a piece
// does not split its history. Returns a function that maps a run to its piece key.
export function buildPieceKeyer(items) {
  const parent = new Map();
  const find = k => { while (parent.get(k) !== k) { parent.set(k, parent.get(parent.get(k))); k = parent.get(k); } return k; };
  const add = k => { if (!parent.has(k)) parent.set(k, k); return k; };
  const union = (x, y) => { const rx = find(add(x)), ry = find(add(y)); if (rx !== ry) parent.set(ry, rx); };
  const titleOwner = new Map();
  for (const h of items) {
    const raw = add(pieceKey(h));
    if (h.repo || h.url || !normTitle(h.title)) continue;
    const t = normTitle(h.title);
    if (titleOwner.has(t)) union(titleOwner.get(t), raw); else titleOwner.set(t, raw);
  }
  return h => { const raw = pieceKey(h); return parent.has(raw) ? find(raw) : raw; };
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
export function groupPieces(items, keyOf = buildPieceKeyer(items)) {
  const map = new Map();
  for (const h of items) {
    const k = keyOf(h);
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
