import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// ─── Set required env before the module is imported ──────────────────────────
process.env.ENCRYPTION_SECRET = 'test-secret-key-exactly-32chars!';

// ─── Mock the DB pool so no real database is touched ─────────────────────────
const poolQuery = vi.fn();
vi.mock('../services/db', () => ({
  pool: { query: (...args: unknown[]) => poolQuery(...args) },
}));

// ─── Dynamically import after env + mocks are in place ───────────────────────
let getCitationChecksByUser: (userId: string, limit?: number) => Promise<any[]>;
let getCitationChecksByTopic: (userId: string, topic: string, limit?: number) => Promise<any[]>;

beforeAll(async () => {
  const mod = await import('../services/dbService');
  getCitationChecksByUser = mod.getCitationChecksByUser;
  getCitationChecksByTopic = mod.getCitationChecksByTopic;
});

beforeEach(() => {
  poolQuery.mockReset();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    topic: 'best widgets 2026',
    topic_key: 'best widgets 2026',
    url: 'https://example.com',
    cited: true,
    alignment_score: 80,
    sources: [],
    recommendations: ['Add FAQ schema'],
    summary: 'Your site is cited.',
    checked_at: new Date('2026-05-01T00:00:00.000Z'),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('getCitationChecksByUser', () => {
  it('executes a SELECT by user_id with default limit 50 and returns mapped records', async () => {
    const row = makeDbRow();
    poolQuery.mockResolvedValueOnce({ rows: [row] });

    const result = await getCitationChecksByUser('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].topic).toBe('best widgets 2026');
    expect(result[0].cited).toBe(true);
    expect(result[0].alignmentScore).toBe(80);
    expect(result[0].checkedAt).toBe('2026-05-01T00:00:00.000Z');

    const [sql, params] = poolQuery.mock.calls[0];
    expect(sql).toMatch(/SELECT \* FROM citation_checks/i);
    expect(sql).toMatch(/WHERE user_id = \$1/i);
    expect(sql).toMatch(/ORDER BY checked_at DESC/i);
    expect(sql).toMatch(/LIMIT \$2/i);
    expect(params).toEqual(['user-1', 50]);
  });

  it('respects a custom limit argument', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    await getCitationChecksByUser('user-1', 10);

    const [, params] = poolQuery.mock.calls[0];
    expect(params).toEqual(['user-1', 10]);
  });

  it('returns an empty array when the user has no citation checks', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getCitationChecksByUser('user-with-no-checks');

    expect(result).toEqual([]);
  });

  it('maps multiple rows correctly', async () => {
    const rows = [
      makeDbRow({ id: 1, cited: true }),
      makeDbRow({ id: 2, cited: false, alignment_score: 40 }),
    ];
    poolQuery.mockResolvedValueOnce({ rows });

    const result = await getCitationChecksByUser('user-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
    expect(result[1].cited).toBe(false);
    expect(result[1].alignmentScore).toBe(40);
  });

  it('maps recommendations as empty array when db returns non-array', async () => {
    const row = makeDbRow({ recommendations: null });
    poolQuery.mockResolvedValueOnce({ rows: [row] });

    const result = await getCitationChecksByUser('user-1');

    expect(result[0].recommendations).toEqual([]);
  });

  it('converts checked_at Date instance to ISO string', async () => {
    const date = new Date('2026-03-15T12:00:00.000Z');
    const row = makeDbRow({ checked_at: date });
    poolQuery.mockResolvedValueOnce({ rows: [row] });

    const result = await getCitationChecksByUser('user-1');

    expect(result[0].checkedAt).toBe('2026-03-15T12:00:00.000Z');
  });

  it('propagates database errors to the caller', async () => {
    poolQuery.mockRejectedValueOnce(new Error('DB connection refused'));

    await expect(getCitationChecksByUser('user-1')).rejects.toThrow('DB connection refused');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('getCitationChecksByTopic', () => {
  it('normalises the topic to a topic_key and queries with default limit 20', async () => {
    const row = makeDbRow();
    poolQuery.mockResolvedValueOnce({ rows: [row] });

    const result = await getCitationChecksByTopic('user-1', 'Best Widgets 2026');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);

    const [sql, params] = poolQuery.mock.calls[0];
    expect(sql).toMatch(/SELECT \* FROM citation_checks/i);
    expect(sql).toMatch(/WHERE user_id = \$1 AND topic_key = \$2/i);
    expect(sql).toMatch(/ORDER BY checked_at DESC/i);
    expect(sql).toMatch(/LIMIT \$3/i);
    expect(params[0]).toBe('user-1');
    expect(params[1]).toBe('best widgets 2026');
    expect(params[2]).toBe(20);
  });

  it('trims and lowercases the topic key', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    await getCitationChecksByTopic('user-1', '  BEST Widgets  ');

    const [, params] = poolQuery.mock.calls[0];
    expect(params[1]).toBe('best widgets');
  });

  it('collapses multiple spaces in the topic key', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    await getCitationChecksByTopic('user-1', 'best   widgets   2026');

    const [, params] = poolQuery.mock.calls[0];
    expect(params[1]).toBe('best widgets 2026');
  });

  it('respects a custom limit argument', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    await getCitationChecksByTopic('user-1', 'best widgets', 5);

    const [, params] = poolQuery.mock.calls[0];
    expect(params[2]).toBe(5);
  });

  it('returns an empty array when no checks match the topic', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getCitationChecksByTopic('user-1', 'unknown topic xyz');

    expect(result).toEqual([]);
  });

  it('maps multiple rows correctly', async () => {
    const rows = [
      makeDbRow({ id: 10, cited: true }),
      makeDbRow({ id: 11, cited: false }),
    ];
    poolQuery.mockResolvedValueOnce({ rows });

    const result = await getCitationChecksByTopic('user-1', 'best widgets 2026');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(10);
    expect(result[1].id).toBe(11);
  });

  it('maps url as null when not present', async () => {
    const row = makeDbRow({ url: null });
    poolQuery.mockResolvedValueOnce({ rows: [row] });

    const result = await getCitationChecksByTopic('user-1', 'best widgets 2026');

    expect(result[0].url).toBeNull();
  });

  it('maps summary as null when not present', async () => {
    const row = makeDbRow({ summary: null });
    poolQuery.mockResolvedValueOnce({ rows: [row] });

    const result = await getCitationChecksByTopic('user-1', 'best widgets 2026');

    expect(result[0].summary).toBeNull();
  });

  it('propagates database errors to the caller', async () => {
    poolQuery.mockRejectedValueOnce(new Error('Query timeout'));

    await expect(getCitationChecksByTopic('user-1', 'best widgets 2026')).rejects.toThrow(
      'Query timeout'
    );
  });
});
