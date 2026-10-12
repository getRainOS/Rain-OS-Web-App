import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

const query = vi.fn();
vi.mock('../services/db', () => ({ pool: { query: (...a: unknown[]) => query(...a) } }));

const findUserById = vi.fn();
const findUserByApiKey = vi.fn();
const saveCitationCheck = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserById: (...a: unknown[]) => findUserById(...a),
  findUserByApiKey: (...a: unknown[]) => findUserByApiKey(...a),
  saveCitationCheck: (...a: unknown[]) => saveCitationCheck(...a),
  setCitationAlerts: vi.fn(),
  normaliseTopicKey: (t: string) => t.trim().toLowerCase(),
}));

const runCitationCheck = vi.fn();
vi.mock('../services/citationCheckService', () => ({
  runCitationCheck: (...a: unknown[]) => runCitationCheck(...a),
}));

const sendCitationStatusEmail = vi.fn();
vi.mock('../services/emailService', () => ({
  sendCitationStatusEmail: (...a: unknown[]) => sendCitationStatusEmail(...a),
}));

import { planTrackingCap, firstRunAt, WEEK_MS, MAX_JITTER_MS } from '../services/trackedQueryService';
import { runTrackedQuery } from '../services/schedulerService';

const proUser: User = {
  id: 'u1', email: 'u@example.com', apiKey: 'k', subscriptionStatus: 'active',
  usage: { count: 0, limit: 200 }, createdAt: new Date(), emailConfirmed: true, citationAlerts: true,
};
const freeUser: User = { ...proUser, usage: { count: 0, limit: 5 } };

const row = { id: 7, user_id: 'u1', name: 'Q', topic: 'best widgets', url: 'https://me.com', last_cited: false, consecutive_failures: 0 };

function sqlRouter(pausedReason: string | null = null) {
  query.mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT paused_reason')) return { rows: [{ paused_reason: pausedReason }] };
    if (sql.includes('COUNT(*)')) return { rows: [{ n: 0 }] };
    return { rows: [], rowCount: 1 };
  });
}

beforeEach(() => {
  query.mockReset();
  findUserById.mockReset();
  findUserByApiKey.mockReset();
  saveCitationCheck.mockReset();
  runCitationCheck.mockReset();
  sendCitationStatusEmail.mockReset();
  delete process.env.STRIPE_PRICE_ID_PRO;
  delete process.env.STRIPE_PRICE_ID_BUSINESS;
});

describe('planTrackingCap', () => {
  it('gives Free no tracking', () => expect(planTrackingCap(freeUser)).toBe(0));
  it('gives Pro 10 by usage limit', () => expect(planTrackingCap(proUser)).toBe(10));
  it('gives Business 30 by usage limit', () => expect(planTrackingCap({ ...proUser, usage: { count: 0, limit: 500 } })).toBe(30));
  it('prefers the configured price ID', () => {
    process.env.STRIPE_PRICE_ID_BUSINESS = 'price_biz';
    expect(planTrackingCap({ ...proUser, stripePriceId: 'price_biz' })).toBe(30);
  });
  it('gives inactive subscriptions nothing', () => {
    expect(planTrackingCap({ ...proUser, subscriptionStatus: 'canceled' as User['subscriptionStatus'] })).toBe(0);
  });
});

describe('firstRunAt', () => {
  it('lands a week out within the jitter window', () => {
    expect(firstRunAt(0, () => 0).getTime()).toBe(WEEK_MS);
    expect(firstRunAt(0, () => 0.999999).getTime()).toBeLessThan(WEEK_MS + MAX_JITTER_MS);
  });
});

describe('runTrackedQuery', () => {
  it('records a scheduled check and emails when citation status changes', async () => {
    sqlRouter();
    findUserById.mockResolvedValue(proUser);
    runCitationCheck.mockResolvedValue({ topic: 'best widgets', url: 'https://me.com', cited: true, sources: [], summary: '' });
    expect(await runTrackedQuery(row)).toBe('ran');
    expect(saveCitationCheck).toHaveBeenCalledWith('u1', expect.objectContaining({ source: 'scheduled', trackedQueryId: 7, cited: true }));
    expect(sendCitationStatusEmail).toHaveBeenCalledWith('u@example.com', { name: 'Q', topic: 'best widgets', cited: true });
  });

  it('does not email when status is unchanged', async () => {
    sqlRouter();
    findUserById.mockResolvedValue(proUser);
    runCitationCheck.mockResolvedValue({ topic: 'best widgets', url: null, cited: false, sources: [], summary: '' });
    await runTrackedQuery(row);
    expect(sendCitationStatusEmail).not.toHaveBeenCalled();
  });

  it('does not email on the first ever result', async () => {
    sqlRouter();
    findUserById.mockResolvedValue(proUser);
    runCitationCheck.mockResolvedValue({ topic: 'best widgets', url: null, cited: true, sources: [], summary: '' });
    await runTrackedQuery({ ...row, last_cited: null });
    expect(sendCitationStatusEmail).not.toHaveBeenCalled();
  });

  it('respects alerts being turned off', async () => {
    sqlRouter();
    findUserById.mockResolvedValue({ ...proUser, citationAlerts: false });
    runCitationCheck.mockResolvedValue({ topic: 'best widgets', url: null, cited: true, sources: [], summary: '' });
    await runTrackedQuery(row);
    expect(sendCitationStatusEmail).not.toHaveBeenCalled();
  });

  it('skips users without a tracking plan and never calls Gemini', async () => {
    sqlRouter();
    findUserById.mockResolvedValue(freeUser);
    expect(await runTrackedQuery(row)).toBe('skipped');
    expect(runCitationCheck).not.toHaveBeenCalled();
  });

  it('skips a query paused by the plan cap', async () => {
    sqlRouter('plan_limit');
    findUserById.mockResolvedValue(proUser);
    expect(await runTrackedQuery(row)).toBe('skipped');
    expect(runCitationCheck).not.toHaveBeenCalled();
  });

  it('retries in an hour after a failure', async () => {
    sqlRouter();
    findUserById.mockResolvedValue(proUser);
    runCitationCheck.mockRejectedValue(new Error('boom'));
    expect(await runTrackedQuery(row)).toBe('failed');
    const update = query.mock.calls.find(c => String(c[0]).includes('consecutive_failures = $2'));
    expect(String(update![0])).toContain('next_run_at');
    expect(update![1]).toEqual([7, 1, 60 * 60 * 1000]);
  });

  it('pauses after the third consecutive failure', async () => {
    sqlRouter();
    findUserById.mockResolvedValue(proUser);
    runCitationCheck.mockRejectedValue(new Error('boom'));
    await runTrackedQuery({ ...row, consecutive_failures: 2 });
    const update = query.mock.calls.find(c => String(c[0]).includes("paused_reason = 'failures'"));
    expect(update![1]).toEqual([7, 3]);
  });
});

describe('tracked-queries API', () => {
  let app: express.Express;
  beforeAll(async () => {
    const h = await import('../api/tracked-queries');
    app = express();
    app.use(express.json());
    app.post('/api/tracked-queries', h.createHandler);
    app.patch('/api/tracked-queries/:id', h.updateHandler);
  });

  it('rejects requests without an API key', async () => {
    const res = await request(app).post('/api/tracked-queries').send({});
    expect(res.status).toBe(401);
  });

  it('returns 402 for Free users', async () => {
    findUserByApiKey.mockResolvedValue(freeUser);
    const res = await request(app).post('/api/tracked-queries').set('Authorization', 'Bearer k')
      .send({ name: 'Q', topic: 'best widgets' });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('plan_required');
  });

  it('returns 409 when the Pro cap is reached', async () => {
    findUserByApiKey.mockResolvedValue(proUser);
    query.mockResolvedValue({ rows: [{ n: 10 }] });
    const res = await request(app).post('/api/tracked-queries').set('Authorization', 'Bearer k')
      .send({ name: 'Q', topic: 'best widgets' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('cap_reached');
  });

  it('validates the topic', async () => {
    findUserByApiKey.mockResolvedValue(proUser);
    const res = await request(app).post('/api/tracked-queries').set('Authorization', 'Bearer k')
      .send({ name: 'Q', topic: 'x' });
    expect(res.status).toBe(400);
  });

  it('requires a boolean paused flag', async () => {
    findUserByApiKey.mockResolvedValue(proUser);
    const res = await request(app).patch('/api/tracked-queries/3').set('Authorization', 'Bearer k').send({ paused: 'yes' });
    expect(res.status).toBe(400);
  });
});
