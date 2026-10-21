import { describe, it, expect } from 'vitest';
import { rewriteSignals } from '../services/rewriteSignals';

describe('rewriteSignals', () => {
  it('shows what a rewrite changed, and whether each change helps', () => {
    const before = 'It was decided by the team that various approaches were used, and this was considered by them to be generally effective in many cases, although some aspects were often unclear to them.';
    const after = '# How the team chose an approach\n\nThe team chose two approaches.\n\nBoth worked well. Two aspects stayed unclear.';
    const s = Object.fromEntries(rewriteSignals(before, after).map(x => [x.label, x]));
    expect(s['Passive voice'].better).toBe(true);
    expect(s['Sentences over 30 words'].better).toBe(true);
    expect(s['Headings per 100 words'].after).not.toBe('0.0');
    expect(s['Word count'].better).toBeNull();
  });
});
