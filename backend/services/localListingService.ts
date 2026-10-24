// services/localListingService.ts — the business's Google listing, through
// DataForSEO's Business Data and SERP APIs:
//   profile  POST /v3/business_data/google/my_business_info/live
//   reviews  POST /v3/business_data/google/reviews/task_post, then
//            GET  /v3/business_data/google/reviews/task_get/{id} (no live endpoint)
//   Maps     POST /v3/serp/google/maps/live/advanced
//
// UNVERIFIED like the rest of the DataForSEO adapter: built from the documented
// API and tested on sample responses (__tests__/fixtures/dataforseo/). It runs
// only when DATAFORSEO_VERIFIED=true.
import { US_STATE_NAMES } from './engines/location';
import { EngineError } from './engines/engineError';
import { extractDomain } from './citationCheckService';

const BASE = 'https://api.dataforseo.com/v3';

export interface ListingProfile {
  name: string;
  category: string | null;
  claimed: boolean | null;
  rating: number | null;
  reviewCount: number | null;
  phone: string;
  address: string;
  website: string;
  photos: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface MapsEntry { position: number; name: string; rating: number | null; reviewCount: number | null; domain: string; isYou: boolean }

export interface ListingCheck {
  found: boolean;
  profile: ListingProfile | null;
  matches: { name: boolean | null; phone: boolean | null; address: boolean | null; website: boolean | null };
  reviews: { checked: number; mentionCity: number; examples: string[] } | null;
  maps: { query: string; position: number | null; top: MapsEntry[] } | null;
  steps: string[];
}

const num = (v: any): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const phoneKey = (s: string) => s.replace(/\D/g, '').slice(-10);

export function placeName(city: string, state: string | null, country = 'US'): string {
  const st = state && US_STATE_NAMES[state] ? US_STATE_NAMES[state] : '';
  if (country !== 'US') return city;
  return [city, st, 'United States'].filter(Boolean).join(',');
}

function firstItem(json: any): any {
  return json?.tasks?.[0]?.result?.[0]?.items?.[0] ?? null;
}

export function parseProfile(json: any): ListingProfile | null {
  const it = firstItem(json);
  if (!it || !(it.title || it.name)) return null;
  const rating = it.rating && typeof it.rating === 'object' ? it.rating : {};
  return {
    name: String(it.title || it.name),
    category: it.category ? String(it.category) : null,
    claimed: typeof it.is_claimed === 'boolean' ? it.is_claimed : null,
    rating: num(rating.value),
    reviewCount: num(rating.votes_count),
    phone: it.phone ? String(it.phone) : '',
    address: it.address ? String(it.address) : '',
    website: it.url ? String(it.url) : it.domain ? `https://${it.domain}` : '',
    photos: num(it.total_photos),
    latitude: num(it.latitude),
    longitude: num(it.longitude),
  };
}

export function parseReviews(json: any): string[] {
  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? [];
  return items.map(i => (typeof i?.review_text === 'string' ? i.review_text : '')).filter(Boolean);
}

export function parseMaps(json: any, you: { name: string; domain: string | null }): MapsEntry[] {
  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? [];
  return items
    .filter(i => i && (i.type === 'maps_search' || i.title))
    .map((i, k) => {
      const domain = i.domain ? extractDomain(String(i.domain)) : i.url ? extractDomain(String(i.url)) : '';
      const name = String(i.title || '');
      const isYou = (!!you.domain && domain === you.domain) || (!!you.name && squash(name) === squash(you.name));
      return {
        position: num(i.rank_group) ?? k + 1,
        name,
        rating: num(i.rating?.value),
        reviewCount: num(i.rating?.votes_count),
        domain,
        isYou,
      };
    });
}

// Compare the Google profile with what the page says.
export function compareListing(
  profile: ListingProfile,
  page: { name: string; phone: string; street: string; url: string | null }
): ListingCheck['matches'] {
  const pageDomain = page.url ? extractDomain(page.url) : null;
  return {
    name: page.name ? squash(profile.name).includes(squash(page.name)) || squash(page.name).includes(squash(profile.name)) : null,
    phone: page.phone && profile.phone ? phoneKey(page.phone) === phoneKey(profile.phone) : null,
    address: page.street && profile.address ? squash(profile.address).includes(squash(page.street)) : null,
    website: pageDomain && profile.website ? extractDomain(profile.website) === pageDomain : null,
  };
}

export function buildSteps(c: Omit<ListingCheck, 'steps'>, city: string): string[] {
  const s: string[] = [];
  if (!c.found || !c.profile) {
    s.push(`We couldn't find a Google Business Profile under this name in ${city}. Create or claim one at business.google.com; Google's AI answers lean on it.`);
    return s;
  }
  const p = c.profile;
  if (p.claimed === false) s.push('Your profile is not claimed. Claim it at business.google.com so you control its details.');
  if (c.matches.phone === false) s.push(`Your Google phone (${p.phone}) doesn't match your website. Use one number everywhere.`);
  if (c.matches.address === false) s.push("Your Google address doesn't match the address on your website. Make them identical.");
  if (c.matches.website === false) s.push("Your Google profile links to a different website. Point it at this site.");
  if (p.reviewCount !== null && p.reviewCount < 20) s.push(`You have ${p.reviewCount} Google reviews. Businesses AI recommends usually have more; ask recent customers.`);
  if (c.reviews && c.reviews.checked > 0 && c.reviews.mentionCity / c.reviews.checked < 0.2) {
    s.push(`Only ${c.reviews.mentionCity} of your last ${c.reviews.checked} reviews mention ${city}. When you ask for reviews, ask customers to say what you did and where.`);
  }
  if (c.maps && c.maps.position === null) s.push(`You're not in the top 20 on Google Maps for "${c.maps.query}". Check your primary category and add ${city} to your service areas.`);
  else if (c.maps && c.maps.position !== null && c.maps.position > 3) s.push(`You're #${c.maps.position} on Google Maps for "${c.maps.query}". The top 3 get most of the attention, from people and AI.`);
  if (p.photos !== null && p.photos < 10) s.push('Add more photos to your profile: your work, your premises, your team.');
  return s;
}

export async function dfs(method: 'GET' | 'POST', path: string, body?: unknown, timeoutMs = 60000): Promise<any> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new EngineError('Google listing checks are not set up yet.', 503, 'engine_unavailable');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: ctrl.signal,
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok || json?.status_code !== 20000) {
      console.error(`[dataforseo] ${path} failed:`, json?.status_code, json?.status_message);
      throw new EngineError('Google listing data is temporarily unavailable. Try again later.', 503, 'engine_unavailable');
    }
    return json;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new EngineError('The listing check took too long. Please try again.', 504, 'timeout');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Reviews have no live endpoint: post a task, then poll for up to ~45s. A
// slow task just means the reviews part is left out, not a failed check.
async function fetchReviews(keyword: string, location: string, wait = (ms: number) => new Promise(r => setTimeout(r, ms))): Promise<string[] | null> {
  const posted = await dfs('POST', '/business_data/google/reviews/task_post', [{ keyword, location_name: location, language_code: 'en', depth: 50, sort_by: 'newest' }]);
  const id = posted?.tasks?.[0]?.id;
  if (!id) return null;
  for (let i = 0; i < 9; i++) {
    await wait(5000);
    const got = await dfs('GET', `/business_data/google/reviews/task_get/${id}`);
    const code = got?.tasks?.[0]?.status_code;
    if (code === 20000) return parseReviews(got);
    if (code && code !== 40601 && code !== 40602) return null; // not "in queue"/"in progress"
  }
  return null;
}

export async function runListingCheck(input: {
  businessName: string;
  city: string;
  state: string | null;
  service: string;
  page: { name: string; phone: string; street: string; url: string | null };
}, deps: { wait?: (ms: number) => Promise<unknown> } = {}): Promise<ListingCheck> {
  const location = placeName(input.city, input.state);
  const keyword = `${input.businessName} ${input.city}`.trim();
  const mapsQuery = `${input.service} ${input.city}`.trim();

  const [profileJson, mapsJson, reviews] = await Promise.all([
    dfs('POST', '/business_data/google/my_business_info/live', [{ keyword, location_name: location, language_code: 'en' }]),
    input.service ? dfs('POST', '/serp/google/maps/live/advanced', [{ keyword: mapsQuery, location_name: location, language_code: 'en', depth: 20 }]) : Promise.resolve(null),
    fetchReviews(keyword, location, deps.wait as any).catch(() => null),
  ]);

  const profile = parseProfile(profileJson);
  const matches = profile ? compareListing(profile, input.page) : { name: null, phone: null, address: null, website: null };
  const you = { name: profile?.name || input.businessName, domain: input.page.url ? extractDomain(input.page.url) : null };
  const top = mapsJson ? parseMaps(mapsJson, you) : [];
  const cityRe = new RegExp(`\\b${input.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  const mentioning = (reviews || []).filter(r => cityRe.test(r));

  const base = {
    found: !!profile,
    profile,
    matches,
    reviews: reviews ? { checked: reviews.length, mentionCity: mentioning.length, examples: mentioning.slice(0, 2).map(r => r.slice(0, 200)) } : null,
    maps: mapsJson ? { query: mapsQuery, position: top.find(t => t.isYou)?.position ?? null, top: top.slice(0, 5) } : null,
  };
  return { ...base, steps: buildSteps(base, input.city) };
}
