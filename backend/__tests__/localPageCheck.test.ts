import { describe, it, expect } from 'vitest';
import { checkLocalPage } from '../services/localPageCheck';

const byId = (r: ReturnType<typeof checkLocalPage>, id: string) => r!.items.find(i => i.id === id);

const good = `<html><head><title>Wedding Cakes in Austin | Sweet Co</title>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Bakery","name":"Sweet Co",
"telephone":"+1 (512) 555-0100","address":{"@type":"PostalAddress","streetAddress":"12 Main St","addressLocality":"Austin","postalCode":"78701"},
"areaServed":["Austin","Round Rock"],"geo":{"@type":"GeoCoordinates","latitude":30.26,"longitude":-97.74}}]}</script></head>
<body><h1>Wedding cakes in Austin</h1><h2>Serving Austin and Round Rock</h2>
<p>Sweet Co bakes custom cakes. We proudly serve Austin couples and venues across the city.</p>
<footer>Sweet Co · 12 Main St, Austin TX 78701 · <a href="tel:5125550100">512-555-0100</a>
<a href="https://www.google.com/maps/place/x">Directions</a></footer></body></html>`;

describe('checkLocalPage', () => {
  it('passes a well-built city page, including @graph schema', () => {
    const r = checkLocalPage(good, 'Austin')!;
    expect(r.items.filter(i => !i.pass).map(i => i.id)).toEqual([]);
    expect(r.passed).toBe(r.total);
  });

  it('flags a page that never names the city and has no local schema', () => {
    const r = checkLocalPage('<html><head><title>Cakes</title></head><body><h1>Cakes</h1><p>We bake cakes.</p></body></html>', 'Austin');
    for (const id of ['city_title', 'city_h1', 'city_body', 'service_area', 'local_detail', 'schema_city', 'schema_geo']) {
      expect(byId(r, id)?.pass).toBe(false);
      expect(byId(r, id)?.fix).toBeTruthy();
    }
    expect(byId(r, 'nap_phone')).toBeUndefined();
  });

  it('notices when the schema city is a different city', () => {
    const r = checkLocalPage(good, 'Dallas');
    expect(byId(r, 'schema_city')?.pass).toBe(false);
    expect(byId(r, 'schema_city')?.detail).toContain('Austin');
  });

  it('catches a phone number that differs from the schema', () => {
    const html = good.replace('512-555-0100', '512-555-0199').replace('tel:5125550100', 'tel:5125550199');
    expect(byId(checkLocalPage(html, 'Austin'), 'nap_phone')?.pass).toBe(false);
  });

  it('does not treat the city as a match inside another word', () => {
    const r = checkLocalPage('<html><head><title>Austintown bakery</title></head><body></body></html>', 'Austin');
    expect(byId(r, 'city_title')?.pass).toBe(false);
  });

  it('with a state, checks the schema state too (Portland, OR vs Portland, ME)', () => {
    const page = (region: string) => `<html><head><title>Plumber in Portland</title>
<script type="application/ld+json">{"@type":"Plumber","name":"Pipe Co","address":{"addressLocality":"Portland","addressRegion":"${region}"}}</script></head>
<body><h1>Portland plumber</h1><p>Pipe Co. Serving Portland homes.</p></body></html>`;
    expect(byId(checkLocalPage(page('OR'), 'Portland', 'OR'), 'schema_state')?.pass).toBe(true);
    expect(byId(checkLocalPage(page('Oregon'), 'Portland', 'OR'), 'schema_state')?.pass).toBe(true);
    expect(byId(checkLocalPage(page('ME'), 'Portland', 'OR'), 'schema_state')?.pass).toBe(false);
    expect(checkLocalPage(page('OR'), 'Portland', 'OR')!.city).toBe('Portland, OR');
    expect(byId(checkLocalPage(page('OR'), 'Portland'), 'schema_state')).toBeUndefined();
  });

  it('with only a state, looks for the name or capital code, not "in"/"or" in sentences', () => {
    const tx = `<html><head><title>Roofing across Texas</title></head><body><h1>TX roofers</h1>
<p>We serve homeowners across Texas. Licensed in TX.</p></body></html>`;
    const r = checkLocalPage(tx, '', 'TX')!;
    expect(r.city).toBe('Texas');
    expect(byId(r, 'city_title')?.pass).toBe(true);
    expect(byId(r, 'city_h1')?.pass).toBe(true);
    expect(byId(r, 'city_body')?.pass).toBe(true);
    expect(byId(r, 'service_area')?.pass).toBe(true);
    const ind = checkLocalPage('<html><head><title>Best roofer in town</title></head><body><h1>Call in or email</h1></body></html>', '', 'IN')!;
    expect(byId(ind, 'city_title')?.pass).toBe(false);
    expect(byId(ind, 'city_h1')?.pass).toBe(false);
  });

  it('returns nothing without a usable city or state', () => {
    expect(checkLocalPage(good, '', 'ZZ')).toBeNull();
  });
});
