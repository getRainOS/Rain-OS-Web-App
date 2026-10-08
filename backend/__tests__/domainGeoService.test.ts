import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

process.env.GEMINI_API_KEY = 'test-key';

// ─── Mock the DB pool so no real database is touched ─────────────────────────
const poolQuery = vi.fn();
vi.mock('../services/db', () => ({
  pool: { query: (...args: unknown[]) => poolQuery(...args) },
}));

// ─── Mock @google/generative-ai SDK — one scripted response per call ─────────
let responses: string[] = [];
let callCount = 0;
const generateContent = vi.fn(async () => {
  const text = responses[callCount] ?? responses[responses.length - 1] ?? '';
  callCount += 1;
  return { response: { text: () => text } };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

let resolveDomainCountries: (domains: string[]) => Promise<Map<string, { name: string; iso: string; flag: string } | null>>;

beforeAll(async () => {
  const mod = await import('../services/domainGeoService');
  resolveDomainCountries = mod.resolveDomainCountries;
});

beforeEach(() => {
  poolQuery.mockReset();
  generateContent.mockClear();
  responses = [];
  callCount = 0;
});

describe('resolveDomainCountries', () => {
  it('returns cached rows without calling Gemini', async () => {
    poolQuery.mockResolvedValueOnce({
      rows: [{ domain: 'example.com', country_name: 'United States', country_iso: '840', country_flag: '🇺🇸' }],
    });

    const result = await resolveDomainCountries(['example.com']);

    expect(result.get('example.com')).toEqual({ name: 'United States', iso: '840', flag: '🇺🇸' });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('grounds an uncached domain via a real search call and caches the result', async () => {
    poolQuery
      .mockResolvedValueOnce({ rows: [] }) // cache miss
      .mockResolvedValueOnce({}); // the INSERT ... ON CONFLICT upsert

    responses = ['{ "country": "Canada", "iso": "124" }'];

    const result = await resolveDomainCountries(['smallbiz.example']);

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(result.get('smallbiz.example')).toEqual({ name: 'Canada', iso: '124', flag: '🇨🇦' });

    // Second call is the cache upsert — verify it persisted the resolved country.
    const [sql, params] = poolQuery.mock.calls[1];
    expect(sql).toMatch(/INSERT INTO domain_countries/i);
    expect(params).toEqual(['smallbiz.example', 'Canada', '124', '🇨🇦']);
  });

  it('caches null for a domain Gemini could not place, rather than erroring', async () => {
    poolQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});

    responses = ['{ "country": null }'];

    const result = await resolveDomainCountries(['totally-obscure.example']);

    expect(result.get('totally-obscure.example')).toBeNull();
    const [, params] = poolQuery.mock.calls[1];
    expect(params).toEqual(['totally-obscure.example', null, null, null]);
  });

  it('degrades to null instead of throwing when Gemini returns unparseable text', async () => {
    poolQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});

    responses = ['Sorry, I could not determine this.'];

    const result = await resolveDomainCountries(['weird-response.example']);

    expect(result.get('weird-response.example')).toBeNull();
  });

  it('only looks up domains missing from the cache', async () => {
    poolQuery
      .mockResolvedValueOnce({
        rows: [{ domain: 'known.com', country_name: 'Germany', country_iso: '276', country_flag: '🇩🇪' }],
      })
      .mockResolvedValueOnce({}); // upsert for the one uncached domain

    responses = ['{ "country": "France", "iso": "250" }'];

    const result = await resolveDomainCountries(['known.com', 'unknown.com']);

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(result.get('known.com')).toEqual({ name: 'Germany', iso: '276', flag: '🇩🇪' });
    expect(result.get('unknown.com')).toEqual({ name: 'France', iso: '250', flag: '🇫🇷' });
  });

  it('returns an empty map for an empty input without touching the DB or Gemini', async () => {
    const result = await resolveDomainCountries([]);

    expect(result.size).toBe(0);
    expect(poolQuery).not.toHaveBeenCalled();
    expect(generateContent).not.toHaveBeenCalled();
  });
});
