import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const findUserByApiKey = vi.fn();
const deleteUserAccount = vi.fn();
const cancelAllSubscriptions = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...a: unknown[]) => findUserByApiKey(...a),
  deleteUserAccount: (...a: unknown[]) => deleteUserAccount(...a),
}));
vi.mock('../services/stripeService', () => ({
  cancelAllSubscriptions: (...a: unknown[]) => cancelAllSubscriptions(...a),
}));

let app: express.Express;
beforeAll(async () => {
  const { default: handler } = await import('../api/users/me/delete-account');
  app = express();
  app.use(express.json());
  app.post('/del', handler);
});

const user = { id: 'u1', email: 'Fred@Example.com', stripeCustomerId: 'cus_1' };
beforeEach(() => {
  findUserByApiKey.mockReset().mockResolvedValue(user);
  deleteUserAccount.mockReset().mockResolvedValue(undefined);
  cancelAllSubscriptions.mockReset().mockResolvedValue(1);
});
const post = (body: object) => request(app).post('/del').set('Authorization', 'Bearer k').send(body);

describe('POST /api/users/me/delete-account', () => {
  it('requires a key', async () => {
    expect((await request(app).post('/del').send({})).status).toBe(401);
  });
  it('refuses without the matching email', async () => {
    expect((await post({ confirm: 'someone@else.com' })).status).toBe(400);
    expect(deleteUserAccount).not.toHaveBeenCalled();
  });
  it('cancels billing, then deletes (email match ignores case)', async () => {
    const res = await post({ confirm: ' fred@example.com ' });
    expect(res.status).toBe(200);
    expect(cancelAllSubscriptions).toHaveBeenCalledWith('cus_1');
    expect(deleteUserAccount).toHaveBeenCalledWith('u1');
  });
  it('deletes nothing when cancelling the subscription fails', async () => {
    cancelAllSubscriptions.mockRejectedValue(new Error('stripe down'));
    expect((await post({ confirm: 'fred@example.com' })).status).toBe(502);
    expect(deleteUserAccount).not.toHaveBeenCalled();
  });
});
