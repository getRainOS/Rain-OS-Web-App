import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/db', () => ({ pool: { connect: vi.fn(), query: vi.fn() } }));

import { pendingMigrations, runMigrations, MIGRATIONS, type Migration } from '../services/dbSetup';

// A fake client that records every statement and answers the bookkeeping queries.
function fakeDb(applied: string[], failOn?: string) {
  const log: string[] = [];
  const client = {
    query: vi.fn(async (text: string) => {
      log.push(text.trim().split(/\s+/).slice(0, 3).join(' '));
      if (failOn && text === failOn) throw new Error('boom');
      if (text.startsWith('SELECT id FROM schema_migrations')) return { rows: applied.map(id => ({ id })) };
      return { rows: [] };
    }),
    release: vi.fn(),
  };
  return { db: { connect: async () => client }, client, log };
}

describe('migrations', () => {
  it('lists only migrations that have not been applied', () => {
    const all: Migration[] = [{ id: '001', statements: [] }, { id: '002', statements: [] }];
    expect(pendingMigrations(all, new Set(['001'])).map(m => m.id)).toEqual(['002']);
    expect(pendingMigrations(all, new Set(['001', '002']))).toEqual([]);
  });

  it('starts with a baseline migration, so existing databases just record it', () => {
    expect(MIGRATIONS[0].id).toBe('001_baseline');
    expect(MIGRATIONS[0].statements.length).toBeGreaterThan(0);
  });

  it('runs pending migrations in order inside transactions and records them', async () => {
    const { db, client } = fakeDb([]);
    const all: Migration[] = [{ id: '001', statements: ['CREATE TABLE a ();'] }, { id: '002', statements: ['CREATE TABLE b ();'] }];
    const ran = await runMigrations(db, all);
    expect(ran).toEqual(['001', '002']);
    const texts = client.query.mock.calls.map(c => c[0]);
    expect(texts.indexOf('BEGIN')).toBeLessThan(texts.indexOf('CREATE TABLE a ();'));
    expect(texts).toContain('INSERT INTO schema_migrations (id) VALUES ($1)');
    expect(client.release).toHaveBeenCalled();
  });

  it('skips applied migrations and rolls back a failing one', async () => {
    const { db, client } = fakeDb(['001'], 'CREATE TABLE b ();');
    const all: Migration[] = [{ id: '001', statements: ['CREATE TABLE a ();'] }, { id: '002', statements: ['CREATE TABLE b ();'] }];
    await expect(runMigrations(db, all)).rejects.toThrow('boom');
    const texts = client.query.mock.calls.map(c => c[0]);
    expect(texts).not.toContain('CREATE TABLE a ();');
    expect(texts).toContain('ROLLBACK');
    expect(texts).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalled();
  });

  it('takes and releases the migration lock', async () => {
    const { db, client } = fakeDb([]);
    await runMigrations(db, []);
    const texts = client.query.mock.calls.map(c => c[0]);
    expect(texts[0]).toBe('SELECT pg_advisory_lock($1)');
    expect(texts).toContain('SELECT pg_advisory_unlock($1)');
  });
});
