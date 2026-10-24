// services/pageBrand.ts — the business or brand name a page declares about
// itself, so URL Scanner can pre-fill it (the user can change it). In order:
// the site's own name (og:site_name), the Organization / LocalBusiness name in
// its structured data, then the part of the <title> that repeats the site
// (before or after " | ", " - ", " — "). Null when nothing clear is found.
import * as cheerio from 'cheerio';

const BUSINESS_TYPES = /^(Organization|Corporation|LocalBusiness|Store|Restaurant|Dentist|MedicalBusiness|ProfessionalService|HomeAndConstructionBusiness|.*Business)$/;

const clean = (s: unknown): string | null => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length >= 2 && t.length <= 60 ? t : null;
};

export function pageBrandName(html: string, pageUrl?: string): string | null {
  const $ = cheerio.load(html || '');
  const og = clean($('meta[property="og:site_name"]').attr('content'));
  if (og) return og;

  const nodes: any[] = [];
  const visit = (n: any) => {
    if (Array.isArray(n)) return n.forEach(visit);
    if (!n || typeof n !== 'object') return;
    nodes.push(n);
    if (n['@graph']) visit(n['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, el) => { try { visit(JSON.parse($(el).html() || '')); } catch { /* skip */ } });
  for (const n of nodes) {
    const types = (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]).map(String);
    if (types.some(t => BUSINESS_TYPES.test(t))) {
      const name = clean(n.name);
      if (name) return name;
    }
  }

  // "Invisalign in Austin | Bright Smile Dental" → the part that looks like the site.
  const title = ($('title').first().text() || '').trim();
  const parts = title.split(/\s+[|–—-]\s+|\s+·\s+/).map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    const host = pageUrl ? (() => { try { return new URL(pageUrl).hostname.replace(/^www\./, '').split('.')[0].toLowerCase(); } catch { return ''; } })() : '';
    const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const byHost = host && parts.find(p => squash(p) && (host.includes(squash(p)) || squash(p).includes(host)));
    return clean(byHost || parts[parts.length - 1]);
  }
  return null;
}
