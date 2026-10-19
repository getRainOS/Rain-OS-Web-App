// One-off supplier test: run a few real questions through cloro and report
// cost, speed, cited sources and whether a given site/brand shows up.
// Usage (needs CLORO_API_KEY and network access to api.cloro.dev):
//   node backend/scripts/cloro-test.mjs [--dry]
// Request fields below follow the example in cloro's docs/articles
// (POST /v1/monitor/<engine>, { prompt, country }); confirm the state field
// name at docs.cloro.dev before trusting the state comparison.
const KEY = process.env.CLORO_API_KEY;
const BASE = 'https://api.cloro.dev/v1/monitor';
const DRY = process.argv.includes('--dry');

const SITE = 'getrainos.com';
const BRAND = 'rain OS';
const CASES = [
  { engine: 'chatgpt', prompt: 'best AI visibility tools for small businesses' },
  { engine: 'chatgpt', prompt: 'how do I get my website cited by ChatGPT' },
  { engine: 'chatgpt', prompt: 'best tools to check if AI mentions my brand' },
  { engine: 'perplexity', prompt: 'best AI visibility tools for small businesses' },
  { engine: 'gemini', prompt: 'best AI visibility tools for small businesses' },
  { engine: 'chatgpt', prompt: 'best wedding cake bakery in Austin' },
  { engine: 'chatgpt', prompt: 'best wedding cake bakery in Austin', state: 'TX' },
];

function sourcesOf(result) {
  const list = result?.sources || result?.citations || [];
  return list.map(s => s.url || s.link || s.uri || '').filter(Boolean);
}

async function run(c) {
  const body = { prompt: c.prompt, country: 'US', ...(c.state ? { state: c.state } : {}) };
  if (DRY) return { ...c, body };
  const t0 = Date.now();
  const res = await fetch(`${BASE}/${c.engine}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  const json = await res.json().catch(() => ({}));
  const result = json.result || json;
  const text = String(result.text || result.markdown || '');
  const sources = sourcesOf(result);
  return {
    engine: c.engine, prompt: c.prompt, state: c.state || '-', status: res.status, seconds: (ms / 1000).toFixed(1),
    credits: json.credits ?? json.creditsUsed ?? res.headers.get('x-credits-used') ?? '?',
    sources: sources.length,
    siteCited: sources.some(u => u.includes(SITE)),
    brandNamed: text.toLowerCase().includes(BRAND.toLowerCase()),
    topSources: sources.slice(0, 5).map(u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } }).join(', '),
    error: res.ok ? '' : JSON.stringify(json).slice(0, 200),
  };
}

if (!KEY && !DRY) { console.error('CLORO_API_KEY is not set.'); process.exit(1); }
const rows = [];
for (const c of CASES) rows.push(await run(c)); // one at a time, to keep timing and credits clear
console.table(rows);
