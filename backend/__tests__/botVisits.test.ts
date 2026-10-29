import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/db', () => ({ pool: { query: vi.fn(async () => ({ rows: [], rowCount: 1 })) } }));

import { classifyBot, recordBotHits } from '../services/botVisits';
import { pool } from '../services/db';

describe('classifyBot', () => {
  it('names the AI crawlers from their User-Agent', () => {
    expect(classifyBot('Mozilla/5.0 AppleWebKit/537.36; compatible; GPTBot/1.2')).toBe('ChatGPT');
    expect(classifyBot('Mozilla/5.0 (compatible; ClaudeBot/1.0)')).toBe('Claude');
    expect(classifyBot('Mozilla/5.0 (compatible; PerplexityBot/1.0)')).toBe('Perplexity');
  });

  it('ignores ordinary browsers and search crawlers', () => {
    expect(classifyBot('Mozilla/5.0 (Windows NT 10.0) Chrome/120.0')).toBeNull();
    expect(classifyBot('Googlebot/2.1')).toBeNull();
    expect(classifyBot('')).toBeNull();
    expect(classifyBot(undefined)).toBeNull();
  });
});

describe('recordBotHits', () => {
  it('counts hits per bot and page, and strips query strings', async () => {
    vi.mocked(pool.query).mockClear();
    const n = await recordBotHits('user-1', 'Example.com', [
      { bot: 'ChatGPT', path: '/pricing?ref=x' },
      { bot: 'ChatGPT', path: '/pricing' },
      { bot: 'Claude', path: '/' },
      { bot: 'NotABot', path: '/' },
    ]);
    expect(n).toBe(3);
    const calls = vi.mocked(pool.query).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1]).toEqual(['user-1', 'example.com', 'ChatGPT', '/pricing', 2]);
    expect(calls[1][1]).toEqual(['user-1', 'example.com', 'Claude', '/', 1]);
  });
});
