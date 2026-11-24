import { describe, it, expect } from 'vitest';
import { computeReadabilityMetrics } from '../services/readability';

describe('computeReadabilityMetrics', () => {
  it('counts Markdown headings and list items, not just HTML', () => {
    const md = '# Pricing guide\n\nStart with a day rate.\n\n## Steps\n\n- Pick a rate\n- Add margin\n1. Quote it\n';
    const m = computeReadabilityMetrics(md);
    const html = computeReadabilityMetrics('<h1>Pricing guide</h1><p>Start with a day rate.</p><h2>Steps</h2><ul><li>Pick a rate</li><li>Add margin</li><li>Quote it</li></ul>');
    expect(m.headingDensity).toBeGreaterThan(0);
    expect(m.listItemRatio).toBeGreaterThan(0);
    expect(m.headingDensity).toBeCloseTo(html.headingDensity, 0);
  });
  it('does not count a # inside a sentence as a heading', () => {
    expect(computeReadabilityMetrics('We ranked #1 in the survey. Prices start at $5.').headingDensity).toBe(0);
  });
  it('counts figures per 100 words', () => {
    const none = computeReadabilityMetrics('Our team works with local clients on every project.');
    const some = computeReadabilityMetrics('Sales rose 34% in 2024 to $2.5 million across 12 stores.');
    expect(none.figureDensity).toBe(0);
    expect(some.figureDensity).toBeGreaterThan(20);
  });
  it('counts absolute source links, not relative ones', () => {
    const m = computeReadabilityMetrics('<p>See <a href="https://www.example.org/study">the study</a> and <a href="/about">about us</a>. Also https://data.gov/x.</p>');
    expect(m.sourceLinkCount).toBe(2);
  });
  it('is deterministic', () => {
    const t = 'Some text. It is often various. This was written by them.';
    expect(computeReadabilityMetrics(t)).toEqual(computeReadabilityMetrics(t));
  });
});
