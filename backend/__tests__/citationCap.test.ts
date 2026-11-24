import { describe, it, expect } from 'vitest';
import { computeReadabilityMetrics } from '../services/readability';
import { citationCap, measuredChecks, measuredFixes, CITATION_CAP } from '../services/contentTypes';

const LONG = 'Our clinic has treated patients in the area since the early years of practice and we keep records of every visit. '.repeat(20);

describe('citation cap', () => {
  it('caps citationSignals when a long page has no figures and no links', () => {
    const m = computeReadabilityMetrics(LONG);
    expect(citationCap(m, LONG, 'blog_post')).toBe(CITATION_CAP);
  });
  it('does not cap when figures and a source link are present', () => {
    const text = LONG + ' Sales rose 34% in 2024 across 12 stores, see https://www.example.org/report for detail. '.repeat(3) + ' Revenue was $2.5 million in 2023 and 2024 across 40 sites.';
    const m = computeReadabilityMetrics(text);
    expect(m.figureDensity).toBeGreaterThanOrEqual(0.5);
    expect(m.sourceLinkCount).toBeGreaterThanOrEqual(1);
    expect(citationCap(m, text, 'blog_post')).toBe(100);
  });
  it('does not apply to short pages where the checks are skipped', () => {
    const short = 'Short page about a shop.';
    const m = computeReadabilityMetrics(short);
    expect(citationCap(m, short, 'blog_post')).toBe(100);
  });
  it('adds a Digital Authority fix when figures are missing on a long page', () => {
    const m = computeReadabilityMetrics(LONG);
    const fixes = measuredFixes(m, LONG, 'blog_post');
    const fig = fixes.find(f => f.metric === 'figureDensity');
    expect(fig?.pillar).toBe('digital_authority');
    expect(fig?.text).toMatch(/figures per 100 words/);
    expect(measuredChecks(m, LONG, 'blog_post').find(c => c.key === 'sourceLinkCount')?.pass).toBe(false);
  });
});
