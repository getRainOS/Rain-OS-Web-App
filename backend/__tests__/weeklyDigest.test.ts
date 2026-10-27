import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/db', () => ({ pool: { query: vi.fn() } }));

import { summarizeWeek, digestEmail, sourceTip, sendWeeklyDigests } from '../services/weeklyDigest';

const check = (o: any) => ({ brand: 'Bright Smile Dental', url: 'https://brightsmiledental.com', cited: false, mentioned: false, sources: [], ...o });

describe('summarizeWeek', () => {
  it('counts named or cited answers and finds the top other source', () => {
    const s = summarizeWeek([
      check({ mentioned: true, sources: [{ domain: 'yelp.com' }, { domain: 'www.brightsmiledental.com' }] }),
      check({ cited: true, sources: [{ domain: 'yelp.com' }, { domain: 'reddit.com' }] }),
      check({ sources: [{ domain: 'reddit.com' }, { domain: 'yelp.com' }] }),
    ], [check({})]);
    expect(s).toMatchObject({ name: 'Bright Smile Dental', answers: 3, recommended: 2, previous: { answers: 1, recommended: 0 }, topSource: 'yelp.com' });
  });

  it('never names your own site as the top source', () => {
    const s = summarizeWeek([check({ sources: [{ domain: 'brightsmiledental.com' }] })], []);
    expect(s.topSource).toBeNull();
  });
});

describe('digestEmail', () => {
  it('leads with the result and shows the fix and source', () => {
    const { subject, html } = digestEmail(
      { name: 'Bright Smile Dental', answers: 5, recommended: 3, previous: { answers: 5, recommended: 1 }, topSource: 'yelp.com' },
      { text: 'Answer "how much is Invisalign" near the top', href: '/analyze/7?fix=1' },
    );
    expect(subject).toBe('AI recommended you 3 of 5 times this week');
    expect(html).toContain('up from last week');
    expect(html).toContain('/analyze/7?fix=1');
    expect(html).toContain('&quot;how much is Invisalign&quot;');
    expect(html).toContain('yelp.com');
  });

  it('says so plainly when AI did not recommend you', () => {
    const { subject, html } = digestEmail({ name: 'Joe', answers: 2, recommended: 0, previous: { answers: 0, recommended: 0 }, topSource: null }, null);
    expect(subject).toBe('Your week in AI answers');
    expect(html).toContain('didn’t recommend Joe');
    expect(html).not.toContain('Fix it with AI');
  });
});

describe('sourceTip', () => {
  it('gives review sites a review tip', () => {
    expect(sourceTip('yelp.com')).toMatch(/review/);
    expect(sourceTip('other.com')).toMatch(/Fix with AI/);
  });
});

describe('sendWeeklyDigests', () => {
  it('only sends on Monday from 14:00 UTC', async () => {
    expect(await sendWeeklyDigests(new Date('2026-10-27T15:00:00Z'))).toBe(0); // a Tuesday
    expect(await sendWeeklyDigests(new Date('2026-10-26T09:00:00Z'))).toBe(0); // Monday morning UTC
  });
});
