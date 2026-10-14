// Builds the link (and router state) that opens "Improve a Question" with the
// sources Gemini actually cited, so advice compares against real results.
export function improveLink({ question, url, mode = 'citation', brand, sources = [], competitors = [], note }) {
  const p = new URLSearchParams({ q: question || '', mode });
  if (url) p.set('url', url);
  if (brand) p.set('brand', brand);
  return {
    to: { pathname: '/improve', search: `?${p}` },
    state: {
      sources: sources.slice(0, 8).map(s => ({
        domain: s.domain || '',
        title: s.title || undefined,
        snippet: s.snippet || undefined,
      })).filter(s => s.domain),
      competitors: competitors.slice(0, 8),
      note: note || undefined,
    },
  };
}
