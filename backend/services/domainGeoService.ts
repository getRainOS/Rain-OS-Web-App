// services/domainGeoService.ts — Domain -> HQ country inference for the
// Citation Monitor's world map.
//
// The map previously inferred geography from a domain's TLD alone (see
// lib/domainCountry.js on the frontend), which is a weak signal: almost
// every company uses a generic .com/.io regardless of where it's based, so
// the map was empty for most accounts.
//
// A first pass asked Gemini to classify domains from parametric knowledge
// alone — but Rain OS's actual users are small businesses, indie
// freelancers, and writers, whose competitors are equally small and
// obscure. Gemini has no memorized knowledge of who they are, so that
// approach degraded to "null for almost everyone" for exactly this
// audience. This version grounds each lookup in a real Google Search (the
// same tool citationCheckService uses) so Gemini can find a small
// business's About/contact page, LinkedIn, or a directory listing instead
// of relying on brand recognition. It costs one real search per new
// domain, so lookups are capped per call and the result is cached forever
// (including a confident "couldn't find it") in a shared, cross-user table
// so no domain is ever searched for twice.
import { GoogleGenerativeAI, type GenerativeModel, type Tool } from '@google/generative-ai';
import { pool } from './db';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export interface DomainCountry {
  name: string;
  iso: string;
  flag: string;
}

// Each lookup is a real grounded search call, not a cheap classification
// call, so this stays small — the cache means the rest fill in across
// later page loads (by this user or others) rather than all at once.
const MAX_DOMAINS_PER_CALL = 8;
// How many of those grounded searches run concurrently.
const CONCURRENCY = 3;

interface GoogleSearchTool {
  googleSearch: Record<string, never>;
}

let _client: GoogleGenerativeAI | null = null;
let _groundedModel: GenerativeModel | null = null;
function getGroundedModel(): GenerativeModel {
  if (!_groundedModel) {
    if (!_client) _client = new GoogleGenerativeAI(API_KEY);
    const tools: GoogleSearchTool[] = [{ googleSearch: {} }];
    _groundedModel = _client.getGenerativeModel({ model: MODEL, tools: tools as unknown as Tool[] });
  }
  return _groundedModel;
}

async function getCachedCountries(domains: string[]): Promise<Map<string, DomainCountry | null>> {
  if (domains.length === 0) return new Map();
  const result = await pool.query(
    'SELECT domain, country_name, country_iso, country_flag FROM domain_countries WHERE domain = ANY($1)',
    [domains]
  );
  const cached = new Map<string, DomainCountry | null>();
  for (const row of result.rows) {
    cached.set(
      row.domain,
      row.country_name ? { name: row.country_name, iso: row.country_iso, flag: row.country_flag } : null
    );
  }
  return cached;
}

async function cacheCountries(entries: Map<string, DomainCountry | null>): Promise<void> {
  for (const [domain, country] of entries) {
    await pool.query(
      `INSERT INTO domain_countries (domain, country_name, country_iso, country_flag, checked_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (domain) DO UPDATE SET
         country_name = EXCLUDED.country_name,
         country_iso = EXCLUDED.country_iso,
         country_flag = EXCLUDED.country_flag,
         checked_at = NOW()`,
      [domain, country?.name ?? null, country?.iso ?? null, country?.flag ?? null]
    );
  }
}

async function lookupDomainWithGrounding(domain: string): Promise<DomainCountry | null> {
  const model = getGroundedModel();
  const prompt = [
    `Search the web to find out what country the business or organization behind the website "${domain}" is`,
    `headquartered or based in. Check their site (About/Contact pages), LinkedIn, business directories, or`,
    `domain registration info if needed — this may be a small business, freelancer, or independent site, not`,
    `necessarily a well-known company.`,
    '',
    'Respond with ONLY a single JSON object, no other text:',
    '{ "country": "United States", "iso": "840" } — using the ISO 3166-1 NUMERIC code for "iso".',
    'If you cannot find a confident answer after searching, respond with exactly: { "country": null }',
  ].join('\n');

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 1024 },
    });
    const raw = result.response.text();
    // Grounded responses can include stray markdown fences or trailing prose
    // despite the instruction — pull out the first {...} block rather than
    // assuming the whole response is clean JSON.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const entry = JSON.parse(match[0]) as { country?: string | null; iso?: string };
    if (!entry.country || !entry.iso) return null;
    return { name: entry.country, iso: entry.iso, flag: isoToFlag(entry.iso) };
  } catch (err) {
    console.error(`Domain geo lookup failed for ${domain}:`, err);
    return null;
  }
}

async function classifyWithGemini(domains: string[]): Promise<Map<string, DomainCountry | null>> {
  const out = new Map<string, DomainCountry | null>();
  for (let i = 0; i < domains.length; i += CONCURRENCY) {
    const batch = domains.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(d => lookupDomainWithGrounding(d)));
    batch.forEach((domain, j) => out.set(domain, results[j]));
  }
  return out;
}

// ISO 3166-1 numeric -> emoji flag isn't derivable algorithmically (unlike
// alpha-2), so this covers the countries Gemini realistically returns for
// company HQs. Anything not listed falls back to a globe glyph rather than
// no flag at all.
const ISO_TO_FLAG: Record<string, string> = {
  '840': '🇺🇸', '826': '🇬🇧', '276': '🇩🇪', '250': '🇫🇷', '724': '🇪🇸', '380': '🇮🇹',
  '528': '🇳🇱', '056': '🇧🇪', '756': '🇨🇭', '040': '🇦🇹', '752': '🇸🇪', '578': '🇳🇴',
  '208': '🇩🇰', '246': '🇫🇮', '616': '🇵🇱', '620': '🇵🇹', '372': '🇮🇪', '300': '🇬🇷',
  '203': '🇨🇿', '124': '🇨🇦', '484': '🇲🇽', '076': '🇧🇷', '032': '🇦🇷', '152': '🇨🇱',
  '170': '🇨🇴', '604': '🇵🇪', '392': '🇯🇵', '410': '🇰🇷', '156': '🇨🇳', '344': '🇭🇰',
  '158': '🇹🇼', '702': '🇸🇬', '458': '🇲🇾', '360': '🇮🇩', '764': '🇹🇭', '704': '🇻🇳',
  '356': '🇮🇳', '586': '🇵🇰', '036': '🇦🇺', '554': '🇳🇿', '710': '🇿🇦', '818': '🇪🇬',
  '784': '🇦🇪', '376': '🇮🇱', '792': '🇹🇷', '643': '🇷🇺', '804': '🇺🇦',
};
function isoToFlag(iso: string): string {
  return ISO_TO_FLAG[iso] || '🌐';
}

/**
 * Resolve a list of domains to their likely HQ country. Cache-first; only
 * never-seen domains (up to MAX_DOMAINS_PER_CALL per call) go to Gemini.
 * Returns null for a domain Gemini couldn't confidently place — callers
 * should treat that the same as "no geographic signal", not an error.
 */
export async function resolveDomainCountries(domains: string[]): Promise<Map<string, DomainCountry | null>> {
  const unique = Array.from(new Set(domains.map(d => d.toLowerCase().trim()).filter(Boolean)));
  if (unique.length === 0) return new Map();

  const cached = await getCachedCountries(unique);
  const uncached = unique.filter(d => !cached.has(d)).slice(0, MAX_DOMAINS_PER_CALL);

  if (uncached.length === 0) return cached;
  if (!API_KEY) return cached; // degrade silently rather than error the page

  const classified = await classifyWithGemini(uncached);
  await cacheCountries(classified);

  const merged = new Map(cached);
  for (const [domain, country] of classified) merged.set(domain, country);
  return merged;
}
