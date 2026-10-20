// services/localPageCheck.ts — does this page clearly serve a target city?
// Runs on the page HTML the URL Scanner already fetched, so it costs nothing.
// It checks what we can read from the page itself: the city in the title,
// headings and text, a service-area statement, local detail, the city in the
// schema markup, and whether the name, address and phone agree between the
// visible page and the schema. It does not check Google, Yelp or directories.
import * as cheerio from 'cheerio';
import { US_STATE_NAMES } from './engines/location';

export interface LocalCheckItem {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
  fix?: string;
}

export interface LocalPageCheck {
  city: string;
  passed: number;
  total: number;
  items: LocalCheckItem[];
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const digits = (s: string) => s.replace(/\D/g, '');
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// The last 10 digits, so +1 (512) 555-0100 and 512.555.0100 compare equal.
const phoneKey = (s: string) => digits(s).slice(-10);

// Every JSON-LD node on the page, including ones nested in @graph.
function schemaNodes($: cheerio.CheerioAPI): any[] {
  const out: any[] = [];
  const visit = (n: any) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== 'object') return;
    out.push(n);
    if (n['@graph']) visit(n['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try { visit(JSON.parse($(el).html() || '')); } catch { /* malformed JSON-LD — skip */ }
  });
  return out;
}

const asList = (v: any): any[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const textOf = (v: any): string =>
  typeof v === 'string' ? v : v && typeof v === 'object' ? String(v.name ?? v.addressLocality ?? '') : '';

// A place to look for: a city name, or a US state written out or as its
// two-letter code. The code only counts in capitals, so "in" or "or" in a
// sentence isn't read as Indiana or Oregon.
function placeMatcher(name: string, code?: string) {
  const src = code ? `\\b(${escapeRe(name)}|${code})\\b` : `\\b(${escapeRe(name)})\\b`;
  const ok = (m: string) => m.toLowerCase() === name.toLowerCase() || (!!code && m === code);
  return {
    src,
    ok,
    count: (text: string) => Array.from(text.matchAll(new RegExp(src, 'gi'))).filter(m => ok(m[1])).length,
    test: (text: string) => Array.from(text.matchAll(new RegExp(src, 'gi'))).some(m => ok(m[1])),
  };
}

// targetCity and/or targetState (a US two-letter code). With both, the city is
// what's checked and the state is used to confirm the schema's state, so a
// Portland, Maine schema doesn't pass a check for Portland, Oregon.
export function checkLocalPage(html: string, targetCity: string, targetState?: string | null): LocalPageCheck | null {
  const cityName = (targetCity || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const stateCode = targetState && US_STATE_NAMES[targetState.toUpperCase()] ? targetState.toUpperCase() : null;
  const stateName = stateCode ? US_STATE_NAMES[stateCode] : '';
  const city = cityName || stateName;
  if (city.length < 2) return null;
  const place = cityName ? placeMatcher(cityName) : placeMatcher(stateName, stateCode || undefined);
  const cityRe = { test: place.test };
  const $ = cheerio.load(html);

  const title = $('title').first().text();
  const h1 = $('h1').map((_, el) => $(el).text()).get().join(' ');
  const subheads = $('h2, h3').map((_, el) => $(el).text()).get().join(' ');
  $('script, style, noscript').remove();
  const body = $('body').text().replace(/\s+/g, ' ');
  const mentions = place.count(body);

  const nodes = schemaNodes(cheerio.load(html));
  const business = nodes.find(n => n.address || n.telephone || n.areaServed || n.geo) || null;
  const address = business ? asList(business.address)[0] : null;
  const schemaLocality = address && typeof address === 'object' ? String(address.addressLocality || '') : '';
  const schemaRegion = address && typeof address === 'object' ? String(address.addressRegion || '') : '';
  // With only a state, the schema's region is what names the place.
  const schemaCity = cityName ? schemaLocality : schemaRegion;
  const areaServed = business ? asList(business.areaServed).map(textOf).filter(Boolean) : [];

  const items: LocalCheckItem[] = [];
  const add = (id: string, label: string, pass: boolean, detail: string, fix?: string) =>
    items.push({ id, label, pass, detail, ...(pass ? {} : { fix }) });

  add('city_title', `${city} in the page title`, cityRe.test(title),
    title ? `Title: "${title.trim().slice(0, 90)}"` : 'The page has no title.',
    `Put ${city} in the title, e.g. "Wedding cakes in ${city} | Your Business".`);
  add('city_h1', `${city} in the main heading`, cityRe.test(h1),
    h1.trim() ? `Main heading: "${h1.trim().slice(0, 90)}"` : 'The page has no main (H1) heading.',
    `Make the main heading name the service and ${city}.`);
  add('city_subheads', `${city} in a section heading`, cityRe.test(subheads),
    cityRe.test(subheads) ? 'At least one section heading names the city.' : 'No section heading (H2/H3) names the city.',
    `Add a section such as "Serving ${city} and nearby areas".`);
  add('city_body', `${city} mentioned in the page text`, mentions >= 2,
    `Mentioned ${mentions} time${mentions === 1 ? '' : 's'} in the visible text.`,
    `Mention ${city} naturally a few times: where you work, who you serve, local examples.`);

  const serviceRe = new RegExp(
    `(?:serv(?:e|es|ing|ice area)|located in|based in|deliver(?:s|ing)? (?:to|across|in)|covering|areas? we serve)[^.!?]{0,80}?${place.src}`, 'gi');
  const hasServiceStatement = Array.from(body.matchAll(serviceRe)).some(m => place.ok(m[1])) || areaServed.some(a => cityRe.test(a));
  add('service_area', 'States the area you serve', hasServiceStatement,
    hasServiceStatement ? `The page says it serves ${city}.` : `No sentence like "serving ${city}" or "based in ${city}".`,
    `Add a plain sentence: "We serve ${city} and the surrounding area, including …" and list nearby neighbourhoods or towns.`);

  const hasMap = $('iframe[src*="google.com/maps"], iframe[src*="maps.google"], a[href*="google.com/maps"], a[href*="maps.apple.com"], a[href*="bing.com/maps"]').length > 0;
  const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(body) || /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/.test(body);
  const localDetail = hasMap || hasZip;
  add('local_detail', 'Has local detail', localDetail,
    localDetail
      ? [hasMap && 'A map or directions link', hasZip && (hasMap ? 'a postcode or ZIP code' : 'A postcode or ZIP code')].filter(Boolean).join(' and ') + ' found on the page.'
      : 'No map, directions link or full address with a postcode or ZIP code.',
    'Add your full address, a map or directions link, and specifics only a local business would know: neighbourhoods, landmarks, venues you work with.');

  add('schema_city', `Schema markup names ${city}`, cityRe.test(schemaCity) || areaServed.some(a => cityRe.test(a)),
    !business ? 'No local business schema with an address or service area.'
      : schemaCity ? `Schema address ${cityName ? 'city' : 'state'}: ${schemaCity}${areaServed.length ? `; serves: ${areaServed.slice(0, 5).join(', ')}` : ''}.`
      : areaServed.length ? `Schema serves: ${areaServed.slice(0, 5).join(', ')}.` : `The schema has no ${cityName ? 'city' : 'state'}.`,
    `Set ${cityName ? 'addressLocality' : 'addressRegion'} to ${cityName || stateCode} in your LocalBusiness schema, or list ${city} in areaServed if you travel to customers.`);
  if (cityName && stateCode) {
    const regionOk = !!schemaRegion && (schemaRegion.toUpperCase() === stateCode || schemaRegion.toLowerCase() === stateName.toLowerCase());
    add('schema_state', `Schema address is in ${stateName}`, regionOk,
      !business ? 'No local business schema with an address.'
        : schemaRegion ? `Schema address state: ${schemaRegion}.` : 'The schema address has no state (addressRegion).',
      `Set "addressRegion": "${stateCode}" in your schema address, so AI doesn't confuse ${cityName}, ${stateCode} with a ${cityName} in another state.`);
  }
  add('schema_area_served', 'Schema lists the area you serve (areaServed)', areaServed.length > 0,
    areaServed.length ? `areaServed: ${areaServed.slice(0, 5).join(', ')}.` : 'No areaServed in the schema.',
    `Add "areaServed": ["${city}", …] to your LocalBusiness schema.`);
  add('schema_geo', 'Schema has map coordinates (geo)', !!business?.geo,
    business?.geo ? 'Latitude and longitude are in the schema.' : 'No geo coordinates in the schema.',
    'Add "geo": { "@type": "GeoCoordinates", "latitude": …, "longitude": … } with your location.');

  // Name, address and phone: does the visible page agree with the schema?
  const pagePhones = Array.from(new Set(
    (body.match(/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g) || []).map(phoneKey).filter(p => p.length === 10)
  ));
  $('a[href^="tel:"]').each((_, el) => {
    const p = phoneKey(String($(el).attr('href')));
    if (p.length === 10 && !pagePhones.includes(p)) pagePhones.push(p);
  });
  const schemaPhone = business?.telephone ? phoneKey(String(business.telephone)) : '';
  if (schemaPhone || pagePhones.length) {
    const ok = !!schemaPhone && pagePhones.includes(schemaPhone) && pagePhones.length === 1;
    add('nap_phone', 'Same phone number everywhere on the page', ok,
      !schemaPhone ? `${pagePhones.length} phone number${pagePhones.length === 1 ? '' : 's'} on the page, none in the schema.`
        : !pagePhones.includes(schemaPhone) ? "The schema's phone number doesn't appear in the page text."
        : pagePhones.length > 1 ? `${pagePhones.length} different phone numbers on the page.`
        : 'The page and schema show the same number.',
      'Use one phone number, written the same way in the page, footer, contact section and schema.');
  }
  const street = address && typeof address === 'object' ? String(address.streetAddress || '') : '';
  if (street) {
    const ok = squash(body).includes(squash(street));
    add('nap_address', 'Same address in the page and schema', ok,
      ok ? 'The schema street address appears on the page.' : `The schema address "${street}" isn't written on the page.`,
      'Show the same street address on the page (often the footer or contact section) as in the schema.');
  }
  const bizName = business?.name ? String(business.name) : '';
  if (bizName) {
    const ok = squash(body + ' ' + title).includes(squash(bizName));
    add('nap_name', 'Same business name in the page and schema', ok,
      ok ? `"${bizName}" appears on the page.` : `The schema name "${bizName}" isn't on the page.`,
      'Use exactly the same business name on the page and in the schema.');
  }

  return { city: cityName && stateCode ? `${cityName}, ${stateCode}` : city, passed: items.filter(i => i.pass).length, total: items.length, items };
}
