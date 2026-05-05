import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const deleteCitationChecksByUser = vi.fn();

vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  deleteCitationChecksByUser: (...args: unknown[]) => deleteCitationChecksByUser(...args),
}));

// ─── Build the express app under test ────────────────────────────────────────
let app: express.Express;
beforeAll(async () => {
  const { bulkDeleteHandler } = await import('../api/citation-check');
  app = express();
  app.use(express.json());
  app.delete('/api/citation-checks', bulkDeleteHandler);
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
  deleteCitationChecksByUser.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks — auth failures', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app).delete('/api/citation-checks');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header has no Bearer token', async () => {
    const res = await request(app)
      .delete('/api/citation-checks')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 401 when the API key does not match any user', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(app)
      .delete('/api/citation-checks')
      .set('Authorization', 'Bearer bad-key');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(res.body.message).toMatch(/invalid api key/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks — clear all (no topic filter)', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 200 and the deleted count when records exist', async () => {
    deleteCitationChecksByUser.mockResolvedValueOnce(7);

    const res = await request(app)
      .delete('/api/citation-checks')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deleted).toBe(7);
    expect(deleteCitationChecksByUser).toHaveBeenCalledWith('user-1', {});
  });

  it('returns 200 with deleted=0 when the user has no citation checks', async () => {
    deleteCitationChecksByUser.mockResolvedValueOnce(0);

    const res = await request(app)
      .delete('/api/citation-checks')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deleted).toBe(0);
    expect(deleteCitationChecksByUser).toHaveBeenCalledWith('user-1', {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks — clear by topic', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('passes trimmed topicKey to dbService and returns the deleted count', async () => {
    deleteCitationChecksByUser.mockResolvedValueOnce(3);

    const res = await request(app)
      .delete('/api/citation-checks?topic=best%20widgets%202026')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deleted).toBe(3);
    expect(deleteCitationChecksByUser).toHaveBeenCalledWith('user-1', {
      topicKey: 'best widgets 2026',
    });
  });

  it('returns 200 with deleted=0 when no checks match the topic', async () => {
    deleteCitationChecksByUser.mockResolvedValueOnce(0);

    const res = await request(app)
      .delete('/api/citation-checks?topic=unknown%20topic')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deleted).toBe(0);
  });

  it('treats a blank topic query param the same as no topic (clears all)', async () => {
    deleteCitationChecksByUser.mockResolvedValueOnce(4);

    const res = await request(app)
      .delete('/api/citation-checks?topic=')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(deleteCitationChecksByUser).toHaveBeenCalledWith('user-1', {});
  });

  it('trims whitespace-only topic and treats it as no filter (clears all)', async () => {
    deleteCitationChecksByUser.mockResolvedValueOnce(2);

    const res = await request(app)
      .delete('/api/citation-checks?topic=%20%20%20')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(deleteCitationChecksByUser).toHaveBeenCalledWith('user-1', {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /api/citation-checks — server error handling', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 500 when dbService throws an unexpected error', async () => {
    deleteCitationChecksByUser.mockRejectedValueOnce(new Error('DB connection lost'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .delete('/api/citation-checks')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
    expect(res.body.message).toBe('DB connection lost');

    consoleSpy.mockRestore();
  });
});
