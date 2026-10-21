import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseDataforseo, buildTask, locationName, runDataforseoCitationCheck } from '../services/engines/dataforseo';
import { availableEngines } from '../services/engines';

const fixture = (n: string) => JSON.parse(readFileSync(join(__dirname, 'fixtures/dataforseo', `${n}.json`), 'utf8'));

describe('DataForSEO adapter (sample responses — unverified against the live API)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('reads AI Overview references in order, once each, and ignores the blue links', () => {
    const a = parseDataforseo('ai_overviews', fixture('ai_overview'));
    expect(a.present).toBe(true);
    expect(a.sources.map(s => s.domain)).toEqual(['theknot.com', 'sweetco.com', 'yelp.com']);
    expect(a.sources[1].url).toBe('https://sweetco.com/wedding-cakes');
    expect(a.text).toContain('Sweet Co');
    expect(a.cost).toBe(0.0035);
  });

  it('notices when Google showed no AI Overview', () => {
    const a = parseDataforseo('ai_overviews', fixture('no_overview'));
    expect(a.present).toBe(false);
    expect(a.sources).toEqual([]);
  });

  it('reads Perplexity annotations as sources', () => {
    const a = parseDataforseo('perplexity', fixture('perplexity'));
    expect(a.sources.map(s => s.domain)).toEqual(['yelp.com', 'austin.eater.com']);
    expect(a.text).toContain('Crumb Lab');
  });

  it('builds the request: location for Google, prompt only for LLMs', () => {
    expect(locationName('US', 'TX')).toBe('Texas,United States');
    expect(locationName('GB')).toBe('United Kingdom');
    expect(buildTask('ai_overviews', 'q', 'US', 'FL')).toMatchObject({ keyword: 'q', location_name: 'Florida,United States', load_async_ai_overview: true });
    expect(buildTask('perplexity', 'q')).toMatchObject({ user_prompt: 'q', web_search: true });
  });

  it('runs a full check against a sample response: cited, position and summary', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'l'); vi.stubEnv('DATAFORSEO_PASSWORD', 'p');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => fixture('ai_overview') });
    vi.stubGlobal('fetch', fetchMock);
    const r = await runDataforseoCitationCheck('ai_overviews', 'best wedding cake bakery in austin', 'https://sweetco.com', 'TX');
    expect(r.cited).toBe(true);
    expect(r.citedSourceIndex).toBe(1);
    expect(r.answerShown).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.dataforseo.com/v3/serp/google/organic/live/advanced');
    expect(init.headers.Authorization).toBe(`Basic ${Buffer.from('l:p').toString('base64')}`);
  });

  it('says plainly when there was no AI Overview, instead of "not cited"', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'l'); vi.stubEnv('DATAFORSEO_PASSWORD', 'p');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => fixture('no_overview') }));
    const r = await runDataforseoCitationCheck('ai_overviews', 'q', 'https://sweetco.com');
    expect(r.answerShown).toBe(false);
    expect(r.summary).toMatch(/didn't show an AI Overview/);
  });

  it('stays off until verified, even with keys set', () => {
    const env = { GEMINI_API_KEY: 'g', DATAFORSEO_LOGIN: 'l', DATAFORSEO_PASSWORD: 'p' } as any;
    expect(availableEngines(env).map(e => e.id)).toEqual(['gemini']);
    expect(availableEngines({ ...env, DATAFORSEO_VERIFIED: 'true' }).map(e => e.id))
      .toEqual(['gemini', 'ai_overviews', 'ai_mode', 'perplexity', 'claude']);
  });
});
