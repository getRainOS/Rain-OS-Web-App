// Read-only test: do pages with more figures and source links get cited more
// often in our own citation checks?
//
// Run where the database is reachable (for example a Railway shell), with the
// connection string in the environment. Nothing is written to the database.
//   DATABASE_URL=... npx tsx scripts/citation-readability-test.ts
//
// What it does:
//   1. Reads content_analyses rows that have page text and a URL.
//   2. Reads citation_checks rows that have a URL.
//   3. Joins them by domain: a page is "cited" when the latest citation check
//      for its domain cited that domain.
//   4. Recomputes figure density and source links from the stored text with
//      the current code, and prints citation rates by band.
//
// This is a correlation on our own data. It does not show that adding figures
// or links causes citations.

import { Client } from 'pg';
import { computeReadabilityMetrics } from '../services/readability';

export interface AnalysisRow { id: number; url: string; content: string }
export interface CheckRow { url: string; cited: boolean; checked_at: string | Date }

export interface PageRow {
  analysisId: number;
  domain: string;
  wordCount: number;
  figureDensity: number;
  sourceLinkCount: number;
  cited: boolean;
}

export interface BandRate { band: string; pages: number; cited: number; rate: number | null }

// Same domain normalisation as the app: lowercase, no leading "www.".
export function domainOf(rawUrl: string): string {
  try {
    const u = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return rawUrl.replace(/^https?:\/\//, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

// Latest check per domain decides whether that domain was cited.
export function citedByDomain(checks: CheckRow[]): Map<string, boolean> {
  const latest = new Map<string, { cited: boolean; at: number }>();
  for (const c of checks) {
    const d = domainOf(c.url);
    const at = new Date(c.checked_at).getTime();
    const prev = latest.get(d);
    if (!prev || at > prev.at) latest.set(d, { cited: c.cited, at });
  }
  return new Map([...latest].map(([d, v]) => [d, v.cited]));
}

// Pages whose domain has a citation check. Pages with no check are left out,
// so "not cited" means "checked and not cited", not "never checked".
export function joinPages(analyses: AnalysisRow[], checks: CheckRow[]): PageRow[] {
  const cited = citedByDomain(checks);
  const rows: PageRow[] = [];
  for (const a of analyses) {
    const domain = domainOf(a.url);
    if (!cited.has(domain)) continue;
    const m = computeReadabilityMetrics(a.content);
    rows.push({
      analysisId: a.id,
      domain,
      wordCount: m.wordCount,
      figureDensity: m.figureDensity,
      sourceLinkCount: m.sourceLinkCount,
      cited: cited.get(domain) === true,
    });
  }
  return rows;
}

// Citation rate per band. Only pages with at least 150 words are included,
// matching the length at which the app checks these signals.
export function bandRates(rows: PageRow[], value: (r: PageRow) => number, bands: Array<{ label: string; test: (v: number) => boolean }>): BandRate[] {
  const eligible = rows.filter(r => r.wordCount >= 150);
  return bands.map(b => {
    const inBand = eligible.filter(r => b.test(value(r)));
    const cited = inBand.filter(r => r.cited).length;
    return { band: b.label, pages: inBand.length, cited, rate: inBand.length ? cited / inBand.length : null };
  });
}

export const FIGURE_BANDS = [
  { label: '0 figures per 100 words', test: (v: number) => v === 0 },
  { label: 'under 0.5', test: (v: number) => v > 0 && v < 0.5 },
  { label: '0.5 to 2', test: (v: number) => v >= 0.5 && v < 2 },
  { label: '2 or more', test: (v: number) => v >= 2 },
];

export const LINK_BANDS = [
  { label: '0 source links', test: (v: number) => v === 0 },
  { label: '1 to 2 source links', test: (v: number) => v >= 1 && v <= 2 },
  { label: '3 or more source links', test: (v: number) => v >= 3 },
];

function printBands(title: string, rates: BandRate[]): void {
  console.log(`\n${title}`);
  for (const r of rates) {
    const pct = r.rate === null ? 'n/a' : `${(r.rate * 100).toFixed(1)}%`;
    console.log(`  ${r.band.padEnd(28)} pages ${String(r.pages).padStart(5)}   cited ${String(r.cited).padStart(5)}   rate ${pct}`);
  }
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Set it in this shell and run again. Nothing was read.');
    process.exit(1);
  }
  const client = new Client({ connectionString: url, ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query('SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY');
    const analyses = (await client.query<AnalysisRow>(
      `SELECT id, url, content FROM content_analyses WHERE url IS NOT NULL AND content IS NOT NULL ORDER BY id DESC LIMIT 5000`
    )).rows;
    const checks = (await client.query<CheckRow>(
      `SELECT url, cited, checked_at FROM citation_checks WHERE url IS NOT NULL ORDER BY checked_at DESC LIMIT 20000`
    )).rows;
    const rows = joinPages(analyses, checks);
    const eligible = rows.filter(r => r.wordCount >= 150).length;
    console.log(`Analyses with text and URL: ${analyses.length}`);
    console.log(`Citation checks with URL:   ${checks.length}`);
    console.log(`Joined pages (domain match): ${rows.length}, of which 150+ words: ${eligible}`);
    printBands('Citation rate by figure density', bandRates(rows, r => r.figureDensity, FIGURE_BANDS));
    printBands('Citation rate by source links', bandRates(rows, r => r.sourceLinkCount, LINK_BANDS));
    console.log('\nCorrelation only. Small bands are unreliable; check the page counts before reading a rate.');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Test failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
