import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const getCitationChecksByUser = vi.fn();
const getCitationChecksByTopic = vi.fn();

vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  getCitationChecksByUser: (...args: unknown[]) => getCitationChecksByUser(...args),
  getCitationChecksByTopic: (...args: unknown[]) => getCitationChecksByTopic(...args),
}));

// ─── Build the express app under test ────────────────────────────────────────
let app: express.Express;
beforeAll(async () => {
  const { listHandler } = await import('../api/citation-check');
  app = express();
  app.use(express.json());
  app.get('/api/citation-checks', listHandler);
});

const baseUser: User = {
  id: 'user-1',
  email: 'u@example.com',
  apiKey: 'valid-key',
  subscriptionStatus: 'active',
  usage: { count: 5, limit: 100 },
  createdAt: new Date(),
};

const sampleRecord = {
  id: 1,
  topic: 'best widgets 2026',
  url: 'https://example.com',
  cited: true,
  alignmentScore: 80,
  sources: [],
  recommendations: ['Add FAQ schema'],
  summary: 'Your site is cited.',
  checkedAt: '2026-05-01T00:00:00.000Z',
};

beforeEach(() => {
  findUserByApiKey.mockReset();
  getCitationChecksByUser.mockReset();
  getCitationChecksByTopic.mockReset();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/citation-checks — auth failures', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app).get('/api/citation-checks');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the Authorization header has no Bearer token', async () => {
    const res = await request(app)
      .get('/api/citation-checks')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key does not match any user', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(app)
      .get('/api/citation-checks')
      .set('Authorization', 'Bearer bad-key');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(res.body.message).toMatch(/invalid api key/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/citation-checks — list all (no topic filter)', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 200 with the records from getCitationChecksByUser', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([sampleRecord]);

    const res = await request(app)
      .get('/api/citation-checks')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.items[0].id).toBe(1);
    expect(getCitationChecksByUser).toHaveBeenCalledWith('user-1', 50);
    expect(getCitationChecksByTopic).not.toHaveBeenCalled();
  });

  it('returns 200 with an empty array when the user has no citation checks', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/citation-checks')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items).toEqual([]);
    expect(res.body.data).toEqual([]);
  });

  it('respects a valid limit query param (clamped to 1–100)', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([sampleRecord]);

    const res = await request(app)
      .get('/api/citation-checks?limit=10')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(getCitationChecksByUser).toHaveBeenCalledWith('user-1', 10);
  });

  it('clamps limit below 1 to 1', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?limit=0')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByUser).toHaveBeenCalledWith('user-1', 1);
  });

  it('clamps limit above 100 to 100', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?limit=999')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByUser).toHaveBeenCalledWith('user-1', 100);
  });

  it('uses default limit of 50 when limit is not a number', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?limit=abc')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByUser).toHaveBeenCalledWith('user-1', 50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/citation-checks — filter by topic', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('routes to getCitationChecksByTopic when topic has 3+ chars', async () => {
    getCitationChecksByTopic.mockResolvedValueOnce([sampleRecord]);

    const res = await request(app)
      .get('/api/citation-checks?topic=best%20widgets%202026')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items).toHaveLength(1);
    expect(getCitationChecksByTopic).toHaveBeenCalledWith('user-1', 'best widgets 2026', 20);
    expect(getCitationChecksByUser).not.toHaveBeenCalled();
  });

  it('returns 200 with empty array when no checks match the topic', async () => {
    getCitationChecksByTopic.mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/citation-checks?topic=unknown%20topic')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items).toEqual([]);
  });

  it('falls back to getCitationChecksByUser when topic is fewer than 3 chars', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?topic=ab')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByUser).toHaveBeenCalled();
    expect(getCitationChecksByTopic).not.toHaveBeenCalled();
  });

  it('falls back to getCitationChecksByUser when topic is whitespace-only (< 3 non-space chars)', async () => {
    getCitationChecksByUser.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?topic=%20%20')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByUser).toHaveBeenCalled();
    expect(getCitationChecksByTopic).not.toHaveBeenCalled();
  });

  it('respects a custom limit when filtering by topic', async () => {
    getCitationChecksByTopic.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?topic=best%20widgets&limit=5')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByTopic).toHaveBeenCalledWith('user-1', 'best widgets', 5);
  });

  it('uses default topic limit of 20 when no limit is given', async () => {
    getCitationChecksByTopic.mockResolvedValueOnce([]);

    await request(app)
      .get('/api/citation-checks?topic=best%20widgets')
      .set('Authorization', 'Bearer valid-key');

    expect(getCitationChecksByTopic).toHaveBeenCalledWith('user-1', 'best widgets', 20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/citation-checks — server error handling', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 500 when getCitationChecksByUser throws an unexpected error', async () => {
    getCitationChecksByUser.mockRejectedValueOnce(new Error('DB connection lost'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .get('/api/citation-checks')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
    expect(res.body.message).toBe('DB connection lost');

    consoleSpy.mockRestore();
  });

  it('returns 500 when getCitationChecksByTopic throws an unexpected error', async () => {
    getCitationChecksByTopic.mockRejectedValueOnce(new Error('Query timeout'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .get('/api/citation-checks?topic=best%20widgets%202026')
      .set('Authorization', 'Bearer valid-key');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
    expect(res.body.message).toBe('Query timeout');

    consoleSpy.mockRestore();
  });
});
