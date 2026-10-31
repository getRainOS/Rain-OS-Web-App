import { describe, it, expect, vi, beforeEach } from 'vitest';

// The scheduler's imports read the encryption key when they load.
vi.hoisted(() => {
  process.env.ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || '0'.repeat(32);
});

const query = vi.fn();
const release = vi.fn();
vi.mock('../services/db', () => ({
  pool: { connect: vi.fn(async () => ({ query, release })) },
}));

import { withSchedulerLock } from '../services/schedulerService';

describe('withSchedulerLock', () => {
  beforeEach(() => {
    query.mockReset();
    release.mockReset();
  });

  it('runs the work and releases the lock when it gets the lock', async () => {
    query.mockResolvedValueOnce({ rows: [{ ok: true }] }).mockResolvedValueOnce({ rows: [] });
    const work = vi.fn(async () => {});

    expect(await withSchedulerLock(work)).toBe(true);
    expect(work).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenLastCalledWith('SELECT pg_advisory_unlock($1)', [7342002]);
    expect(release).toHaveBeenCalled();
  });

  it('skips the work when another instance holds the lock', async () => {
    query.mockResolvedValueOnce({ rows: [{ ok: false }] });
    const work = vi.fn(async () => {});

    expect(await withSchedulerLock(work)).toBe(false);
    expect(work).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
  });

  it('releases the lock even when the work fails', async () => {
    query.mockResolvedValueOnce({ rows: [{ ok: true }] }).mockResolvedValueOnce({ rows: [] });
    await expect(withSchedulerLock(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    expect(query).toHaveBeenLastCalledWith('SELECT pg_advisory_unlock($1)', [7342002]);
    expect(release).toHaveBeenCalled();
  });
});
