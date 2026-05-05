import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const deleteCitationCheck = vi.fn();

vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  deleteCitationCheck: (...args: unknown[]) => deleteCitationCheck(...args),
}));

// ─── Build the express app under test ────────────────────────────────────────
let app: express.Express;
beforeAll(async () => {
  const { deleteHandler } = await import('../api/citation-check');
  app = express();
  app.use(express.json());
  app.delete('/api/citation-checks/:id', deleteHandler);
});

const baseUser: User = {
  id: 'user-1',
  email: 'u@example.com',
  apiKey: 'valid-key',
  subscriptionStatus: 'active',
  usage: { count: 5, limit: 100 },
  createdAt: new Date(),
};

beforeEach(() => {
  findUserByApiKey.mockReset();
  deleteCitationCheck.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks/:id — auth failures', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app).delete('/api/citation-checks/1');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header has no Bearer token', async () => {
    const res = await request(app)
      .delete('/api/citation-checks/1')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 401 when the API key does not match any user', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(app)
      .delete('/api/citation-checks/1')
      .set('Authorization', 'Bearer bad-key');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(res.body.message).toMatch(/invalid api key/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks/:id — bad id validation', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 400 when id is a non-numeric string', async () => {
    const res = await request(app)
      .delete('/api/citation-checks/abc')
      .set('Authorization', 'Bearer valid-key');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(res.body.message).toMatch(/positive integer/i);
    expect(deleteCitationCheck).not.toHaveBeenCalled();
  });

  it('returns 400 when id is zero', async () => {
    const res = await request(app)
      .delete('/api/citation-checks/0')
      .set('Authorization', 'Bearer valid-key');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(deleteCitationCheck).not.toHaveBeenCalled();
  });

  it('returns 400 when id is negative', async () => {
    const res = await request(app)
      .delete('/api/citation-checks/-5')
      .set('Authorization', 'Bearer valid-key');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(deleteCitationCheck).not.toHaveBeenCalled();
  });

  it('returns 400 when id is purely non-numeric (e.g. "abc123")', async () => {
    const res = await request(app)
      .delete('/api/citation-checks/abc123')
      .set('Authorization', 'Bearer valid-key');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(deleteCitationCheck).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks/:id — not found', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 404 when the citation check does not exist', async () => {
    deleteCitationCheck.mockResolvedValueOnce(false);

    const res = await request(app)
      .delete('/api/citation-checks/999')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not_found');
    expect(deleteCitationCheck).toHaveBeenCalledWith('user-1', 999);
  });

  it('returns 404 when the record belongs to a different user', async () => {
    deleteCitationCheck.mockResolvedValueOnce(false);

    const res = await request(app)
      .delete('/api/citation-checks/42')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not_found');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks/:id — successful delete', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 200 with success:true when the record is deleted', async () => {
    deleteCitationCheck.mockResolvedValueOnce(true);

    const res = await request(app)
      .delete('/api/citation-checks/42')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(deleteCitationCheck).toHaveBeenCalledWith('user-1', 42);
  });

  it('passes the parsed integer id to dbService', async () => {
    deleteCitationCheck.mockResolvedValueOnce(true);

    await request(app)
      .delete('/api/citation-checks/7')
      .set('Authorization', 'Bearer valid-key');

    expect(deleteCitationCheck).toHaveBeenCalledWith('user-1', 7);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks/:id — server error handling', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 500 when dbService throws an unexpected error', async () => {
    deleteCitationCheck.mockRejectedValueOnce(new Error('DB connection lost'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .delete('/api/citation-checks/1')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
    expect(res.body.message).toBe('DB connection lost');

    consoleSpy.mockRestore();
  });
});
