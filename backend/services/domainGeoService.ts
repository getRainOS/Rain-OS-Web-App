// services/domainGeoService.ts — Domain -> HQ country inference for the
// Citation Monitor's world map.
//
// The map previously inferred geography from a domain's TLD alone (see
// lib/domainCountry.js on the frontend), which is a weak signal: almost
// every company uses a generic .com/.io regardless of where it's based, so
// the map was empty for most accounts. This asks Gemini instead — it
// generally knows where real, notable companies are headquartered — and
// caches every answer (including "couldn't place it") in a shared,
// cross-user table so we never re-ask about the same domain twice.
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { pool } from './db';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export interface DomainCountry {
  name: string;
  iso: string;
  flag: string;
}

// Cap how many never-seen domains we'll ask Gemini about in a single
// request, so one pathological call (a user with hundreds of competitor
// domains) can't blow up the prompt or the token budget.
const MAX_DOMAINS_PER_CALL = 60;

let _client: GoogleGenerativeAI | null = null;
let _model: GenerativeModel | null = null;
function getModel(): GenerativeModel {
  if (!_model) {
    if (!_client) _client = new GoogleGenerativeAI(API_KEY);
    _model = _client.getGenerativeModel({ model: MODEL });
  }
  return _model;
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

async function classifyWithGemini(domains: string[]): Promise<Map<string, DomainCountry | null>> {
  const model = getModel();
  const prompt = [
    'For each domain below, identify the country where that company/organization is headquartered.',
    'Respond with a single JSON object mapping each domain to either an object or null:',
    '{ "example.com": { "country": "United States", "iso": "840" } }',
    'Use the ISO 3166-1 NUMERIC code (e.g. "840" for United States, "276" for Germany, "392" for Japan) for "iso".',
    'If you are not confident where a domain\'s company is headquartered, map it to null — do not guess.',
    '',
    `DOMAINS: ${JSON.stringify(domains)}`,
    '',
    'Return ONLY the JSON object, no other text.',
  ].join('\n');

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const raw = result.response.text();
  let parsed: Record<string, { country: string; iso: string } | null>;
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    // Parsing failure degrades to "unknown for everything we asked about"
    // rather than throwing — a bad map response shouldn't break the page.
    parsed = {};
  }

  const out = new Map<string, DomainCountry | null>();
  for (const domain of domains) {
    const entry = parsed[domain];
    out.set(
      domain,
      entry && entry.country && entry.iso
        ? { name: entry.country, iso: entry.iso, flag: isoToFlag(entry.iso) }
        : null
    );
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
