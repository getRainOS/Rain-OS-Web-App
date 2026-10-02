import { describe, it, expect } from 'vitest';
import { checkCrawlerAccess, checkAllCrawlers, scoreAiCrawlerAccess, AI_CRAWLERS } from '../services/robotsCheck';

describe('checkCrawlerAccess', () => {
  it('returns not_mentioned when the file is empty', () => {
    expect(checkCrawlerAccess('', 'GPTBot')).toBe('not_mentioned');
  });

  it('returns not_mentioned when neither the crawler nor a wildcard block appears', () => {
    const txt = 'User-agent: Bingbot\nDisallow: /private';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('not_mentioned');
  });

  it('detects an explicit per-crawler block', () => {
    const txt = 'User-agent: GPTBot\nDisallow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
  });

  it('is case-insensitive on the crawler name', () => {
    const txt = 'User-agent: gptbot\nDisallow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
  });

  it('treats an explicit Allow: / as allowed', () => {
    const txt = 'User-agent: GPTBot\nAllow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('allowed');
  });

  it('does NOT flag a crawler as allowed just because its name appears elsewhere in a Disallow block — the old substring-match false positive', () => {
    const txt = 'User-agent: GPTBot\nDisallow: /';
    // Old logic: (robotsTxt||'').includes('gptbot') → true → wrongly "allowed".
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
  });

  it('falls back to the wildcard block when the crawler has no block of its own', () => {
    const txt = 'User-agent: *\nDisallow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
  });

  it('a specific Allow overrides a blanket wildcard Disallow', () => {
    const txt = 'User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('allowed');
  });

  it('a specific Disallow overrides an allow-all wildcard', () => {
    const txt = 'User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
  });

  it('groups consecutive User-agent lines so they share the same rules', () => {
    const txt = 'User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
    expect(checkCrawlerAccess(txt, 'ClaudeBot')).toBe('blocked');
  });

  it('a sub-path Disallow does not block the whole site', () => {
    const txt = 'User-agent: GPTBot\nDisallow: /private';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('allowed');
  });

  it('an empty Disallow value means allow everything, even after a prior blanket Disallow', () => {
    const txt = 'User-agent: GPTBot\nDisallow: /\nDisallow:';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('allowed');
  });

  it('ignores comments and blank lines', () => {
    const txt = '# block AI\nUser-agent: GPTBot\n\nDisallow: /\n# end';
    expect(checkCrawlerAccess(txt, 'GPTBot')).toBe('blocked');
  });
});

describe('checkAllCrawlers', () => {
  it('checks all 4 tracked crawlers and preserves AI_CRAWLERS order', () => {
    const statuses = checkAllCrawlers(null);
    expect(statuses.map(s => s.crawler)).toEqual([...AI_CRAWLERS]);
    expect(statuses.every(s => s.access === 'not_mentioned')).toBe(true);
  });

  it('reports a mix of allowed, blocked, and not_mentioned', () => {
    const txt = [
      'User-agent: GPTBot',
      'Disallow: /',
      '',
      'User-agent: ClaudeBot',
      'Allow: /',
      '',
      'User-agent: *',
      'Allow: /',
    ].join('\n');
    const statuses = checkAllCrawlers(txt);
    const byName = Object.fromEntries(statuses.map(s => [s.crawler, s.access]));
    expect(byName['GPTBot']).toBe('blocked');
    expect(byName['ClaudeBot']).toBe('allowed');
    expect(byName['Google-Extended']).toBe('allowed'); // falls back to "*" Allow
    expect(byName['PerplexityBot']).toBe('allowed');
  });

  it('treats a null robots.txt the same as an empty one', () => {
    expect(checkAllCrawlers(null)).toEqual(checkAllCrawlers(''));
  });
});

describe('scoreAiCrawlerAccess', () => {
  it('scores 0 when there is no robots.txt and all crawlers are blocked (impossible in practice, but checks the floor)', () => {
    const blockedAll = AI_CRAWLERS.map(crawler => ({ crawler, access: 'blocked' as const }));
    expect(scoreAiCrawlerAccess(false, blockedAll)).toBe(0);
  });

  it('awards 3 points per crawler even with no robots.txt file, since silence defaults to allowed', () => {
    const statuses = checkAllCrawlers(null);
    expect(scoreAiCrawlerAccess(false, statuses)).toBe(12); // 4 crawlers * 3, no file-existence bonus
  });

  it('awards the full 17 points when the file exists and nothing is blocked', () => {
    const statuses = AI_CRAWLERS.map(crawler => ({ crawler, access: 'allowed' as const }));
    expect(scoreAiCrawlerAccess(true, statuses)).toBe(17);
  });

  it('treats not_mentioned the same as allowed', () => {
    const allAllowed = AI_CRAWLERS.map(crawler => ({ crawler, access: 'allowed' as const }));
    const allNotMentioned = AI_CRAWLERS.map(crawler => ({ crawler, access: 'not_mentioned' as const }));
    expect(scoreAiCrawlerAccess(true, allAllowed)).toBe(scoreAiCrawlerAccess(true, allNotMentioned));
  });

  it('deducts only for blocked crawlers, not for missing-file status', () => {
    const statuses: Array<{ crawler: string; access: 'allowed' | 'blocked' | 'not_mentioned' }> = [
      { crawler: 'GPTBot', access: 'blocked' },
      { crawler: 'ClaudeBot', access: 'allowed' },
      { crawler: 'Google-Extended', access: 'not_mentioned' },
      { crawler: 'PerplexityBot', access: 'blocked' },
    ];
    // file exists (+5) + 2 non-blocked crawlers (+3 each) = 11
    expect(scoreAiCrawlerAccess(true, statuses)).toBe(11);
  });
});
