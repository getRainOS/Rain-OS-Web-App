import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// ─── Set required env before the module is imported ──────────────────────────
process.env.ENCRYPTION_SECRET = 'test-secret-key-exactly-32chars!';

// ─── Mock the DB pool so no real database is touched ─────────────────────────
const poolQuery = vi.fn();
vi.mock('../services/db', () => ({
  pool: { query: (...args: unknown[]) => poolQuery(...args) },
}));

// ─── Dynamically import after env + mocks are in place ───────────────────────
let deleteCitationChecksByUser: (
  userId: string,
  opts?: { topicKey?: string }
) => Promise<number>;

beforeAll(async () => {
  const mod = await import('../services/dbService');
  deleteCitationChecksByUser = mod.deleteCitationChecksByUser;
});

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  poolQuery.mockReset();
});

describe('deleteCitationChecksByUser — no topicKey (clear all for user)', () => {
  it('executes a DELETE by user_id only and returns the rowCount', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 5 });

    const count = await deleteCitationChecksByUser('user-1');

    expect(count).toBe(5);
    const [sql, params] = poolQuery.mock.calls[0];
    expect(sql).toMatch(/DELETE FROM citation_checks WHERE user_id = \$1/i);
    expect(params).toEqual(['user-1']);
  });

  it('returns 0 when the user has no citation checks', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 0 });

    const count = await deleteCitationChecksByUser('user-with-no-checks');

    expect(count).toBe(0);
  });

  it('returns 0 when rowCount is null (driver quirk)', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: null });

    const count = await deleteCitationChecksByUser('user-1');

    expect(count).toBe(0);
  });

  it('accepts an empty opts object and still clears all records for the user', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 3 });

    const count = await deleteCitationChecksByUser('user-1', {});

    expect(count).toBe(3);
    const [sql] = poolQuery.mock.calls[0];
    expect(sql).not.toMatch(/topic_key/i);
  });
});

describe('deleteCitationChecksByUser — with topicKey', () => {
  it('executes a DELETE filtered by user_id and topic_key', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 2 });

    const count = await deleteCitationChecksByUser('user-1', {
      topicKey: 'best widgets 2026',
    });

    expect(count).toBe(2);
    const [sql, params] = poolQuery.mock.calls[0];
    expect(sql).toMatch(/DELETE FROM citation_checks WHERE user_id = \$1 AND topic_key = \$2/i);
    expect(params[0]).toBe('user-1');
    expect(params[1]).toBe('best widgets 2026');
  });

  it('normalises the topicKey (trims and lowercases)', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 1 });

    await deleteCitationChecksByUser('user-1', { topicKey: '  Best Widgets  ' });

    const [, params] = poolQuery.mock.calls[0];
    expect(params[1]).toBe('best widgets');
  });

  it('returns 0 when no records match the topic', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 0 });

    const count = await deleteCitationChecksByUser('user-1', {
      topicKey: 'nonexistent topic',
    });

    expect(count).toBe(0);
  });

  it('returns 0 when rowCount is null for a topic-filtered delete', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: null });

    const count = await deleteCitationChecksByUser('user-1', { topicKey: 'some topic' });

    expect(count).toBe(0);
  });
});
