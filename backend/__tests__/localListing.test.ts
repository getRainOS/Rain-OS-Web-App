import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseProfile, parseMaps, compareListing, placeName, runListingCheck } from '../services/localListingService';

const fx = (n: string) => JSON.parse(readFileSync(join(__dirname, 'fixtures/dataforseo', `${n}.json`), 'utf8'));
const page = { name: 'Sweet Co', phone: '512-555-0100', street: '12 Main St', url: 'https://sweetco.com' };

describe('Google listing check (sample responses — unverified against the live API)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('reads the business profile', () => {
    expect(parseProfile(fx('gbp_info'))).toMatchObject({ name: 'Sweet Co Bakery', category: 'Wedding bakery', claimed: false, rating: 4.7, reviewCount: 12 });
  });

  it('compares the profile with the page', () => {
    expect(compareListing(parseProfile(fx('gbp_info'))!, page)).toEqual({ name: true, phone: false, address: true, website: true });
  });

  it('finds you on Google Maps by website or name', () => {
    const top = parseMaps(fx('maps'), { name: 'Sweet Co Bakery', domain: 'sweetco.com' });
    expect(top.find(t => t.isYou)?.position).toBe(4);
    expect(top[0]).toMatchObject({ name: 'Crumb Lab', reviewCount: 310 });
  });

  it('builds the place name DataForSEO expects', () => {
    expect(placeName('Austin', 'TX')).toBe('Austin,Texas,United States');
  });

  it('runs the whole check and turns gaps into steps', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'l'); vi.stubEnv('DATAFORSEO_PASSWORD', 'p');
    const ok = (j: any) => ({ ok: true, status: 200, json: async () => j });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('my_business_info')) return ok(fx('gbp_info'));
      if (url.includes('maps')) return ok(fx('maps'));
      if (url.includes('task_post')) return ok(fx('gbp_reviews_post'));
      if (url.includes('task_get/rev-1')) return ok(fx('gbp_reviews_get'));
      throw new Error(url);
    }));
    const r = await runListingCheck({ businessName: 'Sweet Co', city: 'Austin', state: 'TX', service: 'wedding cake bakery', page }, { wait: async () => {} });
    expect(r.found).toBe(true);
    expect(r.reviews).toEqual({ checked: 3, mentionCity: 1, examples: ['Best wedding cake we found in Austin!'] });
    expect(r.maps).toMatchObject({ query: 'wedding cake bakery Austin', position: 4 });
    const text = r.steps.join(' ');
    expect(text).toMatch(/not claimed/);
    expect(text).toMatch(/phone/);
    expect(text).toMatch(/12 Google reviews/);
    expect(text).toMatch(/#4 on Google Maps/);
    expect(text).toMatch(/photos/);
  });

  it('says plainly when there is no profile', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'l'); vi.stubEnv('DATAFORSEO_PASSWORD', 'p');
    const empty = { status_code: 20000, tasks: [{ status_code: 20000, result: [{ items: [] }] }] };
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => empty })));
    const r = await runListingCheck({ businessName: 'Nobody', city: 'Austin', state: 'TX', service: '', page }, { wait: async () => {} });
    expect(r.found).toBe(false);
    expect(r.steps[0]).toMatch(/couldn't find a Google Business Profile/);
  });
});
