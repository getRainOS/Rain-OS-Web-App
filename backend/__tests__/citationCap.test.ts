import { describe, it, expect } from 'vitest';
import { computeReadabilityMetrics } from '../services/readability';
import { measuredChecks, measuredFixes } from '../services/contentTypes';

const LONG = 'Our clinic has treated patients in the area since the early years of practice and we keep records of every visit. '.repeat(20);

describe('figure and source checks', () => {
  it('flags a long page with no figures and no links', () => {
    const m = computeReadabilityMetrics(LONG);
    const checks = measuredChecks(m, LONG, 'blog_post');
    expect(checks.find(c => c.key === 'figureDensity')?.pass).toBe(false);
    expect(checks.find(c => c.key === 'sourceLinkCount')?.pass).toBe(false);
  });
  it('adds a Digital Authority fix when figures are missing on a long page', () => {
    const m = computeReadabilityMetrics(LONG);
    const fig = measuredFixes(m, LONG, 'blog_post').find(f => f.metric === 'figureDensity');
    expect(fig?.pillar).toBe('digital_authority');
    expect(fig?.text).toMatch(/figures per 100 words/);
  });
});
