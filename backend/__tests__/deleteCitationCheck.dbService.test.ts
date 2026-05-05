import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// ─── Set required env before the module is imported ──────────────────────────
process.env.ENCRYPTION_SECRET = 'test-secret-key-exactly-32chars!';

// ─── Mock the DB pool so no real database is touched ─────────────────────────
const poolQuery = vi.fn();
vi.mock('../services/db', () => ({
  pool: { query: (...args: unknown[]) => poolQuery(...args) },
}));

// ─── Dynamically import after env + mocks are in place ───────────────────────
let deleteCitationCheck: (userId: string, id: number) => Promise<boolean>;

beforeAll(async () => {
  const mod = await import('../services/dbService');
  deleteCitationCheck = mod.deleteCitationCheck;
});

beforeEach(() => {
  poolQuery.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────

describe('deleteCitationCheck — record found', () => {
  it('executes DELETE filtered by id and user_id and returns true', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await deleteCitationCheck('user-1', 42);

    expect(result).toBe(true);
    const [sql, params] = poolQuery.mock.calls[0];
    expect(sql).toMatch(/DELETE FROM citation_checks WHERE id = \$1 AND user_id = \$2/i);
    expect(params).toEqual([42, 'user-1']);
  });
});

describe('deleteCitationCheck — record not found', () => {
  it('returns false when rowCount is 0 (no matching record)', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await deleteCitationCheck('user-1', 99);

    expect(result).toBe(false);
  });

  it('returns false when rowCount is null (driver quirk)', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: null });

    const result = await deleteCitationCheck('user-1', 7);

    expect(result).toBe(false);
  });

  it('returns false when the id belongs to a different user', async () => {
    poolQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await deleteCitationCheck('user-2', 42);

    expect(result).toBe(false);
    const [, params] = poolQuery.mock.calls[0];
    expect(params[1]).toBe('user-2');
  });
});

describe('deleteCitationCheck — error propagation', () => {
  it('propagates database errors to the caller', async () => {
    poolQuery.mockRejectedValueOnce(new Error('DB connection lost'));

    await expect(deleteCitationCheck('user-1', 1)).rejects.toThrow('DB connection lost');
  });
});
