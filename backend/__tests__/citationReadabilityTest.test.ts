import { describe, it, expect } from 'vitest';
import { domainOf, citedByDomain, joinPages, bandRates, FIGURE_BANDS } from '../scripts/citation-readability-test';

const LONG_NO_FIG = 'Our clinic has treated patients in the area for many years and we keep careful records. '.repeat(20);
const LONG_FIG = 'Our clinic saw 1,240 patients in 2024, up 18% on 2023, with an average wait of 12 days. '.repeat(10);

describe('citation readability test helpers', () => {
  it('normalises domains like the app does', () => {
    expect(domainOf('https://www.Example.com/page')).toBe('example.com');
    expect(domainOf('example.com/x')).toBe('example.com');
  });
  it('uses the latest check per domain', () => {
    const map = citedByDomain([
      { url: 'https://a.com', cited: true, checked_at: '2026-01-01' },
      { url: 'https://www.a.com', cited: false, checked_at: '2026-02-01' },
    ]);
    expect(map.get('a.com')).toBe(false);
  });
  it('joins only pages whose domain was checked', () => {
    const rows = joinPages(
      [
        { id: 1, url: 'https://a.com/post', content: LONG_FIG },
        { id: 2, url: 'https://b.com/post', content: LONG_NO_FIG },
      ],
      [{ url: 'https://a.com', cited: true, checked_at: '2026-01-01' }],
    );
    expect(rows.map(r => r.analysisId)).toEqual([1]);
    expect(rows[0].cited).toBe(true);
    expect(rows[0].figureDensity).toBeGreaterThan(0);
  });
  it('reports rates by band and excludes pages under 150 words', () => {
    const rows = joinPages(
      [
        { id: 1, url: 'https://a.com/1', content: LONG_FIG },
        { id: 2, url: 'https://b.com/1', content: LONG_NO_FIG },
        { id: 3, url: 'https://c.com/1', content: 'Too short.' },
      ],
      [
        { url: 'https://a.com', cited: true, checked_at: '2026-01-01' },
        { url: 'https://b.com', cited: false, checked_at: '2026-01-01' },
        { url: 'https://c.com', cited: true, checked_at: '2026-01-01' },
      ],
    );
    const rates = bandRates(rows, r => r.figureDensity, FIGURE_BANDS);
    expect(rates.reduce((n, r) => n + r.pages, 0)).toBe(2);
    expect(rates.find(r => r.band === '0 figures per 100 words')?.rate).toBe(0);
  });
});
