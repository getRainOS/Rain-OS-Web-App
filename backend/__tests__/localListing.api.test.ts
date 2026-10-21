import { describe, it, expect, beforeAll, beforeEach, vi, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const findUserByApiKey = vi.fn();
vi.mock('../services/dbService', () => ({ findUserByApiKey: (...a: unknown[]) => findUserByApiKey(...a) }));
const runListingCheck = vi.fn();
vi.mock('../services/localListingService', () => ({ runListingCheck: (...a: unknown[]) => runListingCheck(...a) }));

let app: express.Express;
beforeAll(async () => {
  const m = await import('../api/local-listing');
  app = express(); app.use(express.json()); app.post('/x', m.default);
});
const paid = { id: 'u1', subscriptionStatus: 'active', usage: { count: 0, limit: 200 } };
beforeEach(() => { findUserByApiKey.mockReset().mockResolvedValue(paid); runListingCheck.mockReset().mockResolvedValue({ found: true, steps: [] }); });
afterEach(() => vi.unstubAllEnvs());
const on = () => { vi.stubEnv('DATAFORSEO_LOGIN', 'l'); vi.stubEnv('DATAFORSEO_PASSWORD', 'p'); vi.stubEnv('DATAFORSEO_VERIFIED', 'true'); };
const post = (body: any) => request(app).post('/x').set('Authorization', 'Bearer k').send(body);

describe('POST /api/local-listing', () => {
  it('is off until DataForSEO is verified', async () => {
    vi.stubEnv('DATAFORSEO_LOGIN', 'l'); vi.stubEnv('DATAFORSEO_PASSWORD', 'p');
    expect((await post({ businessName: 'Sweet Co', city: 'Austin' })).status).toBe(503);
  });
  it('is for paid plans', async () => {
    on(); findUserByApiKey.mockResolvedValue({ ...paid, usage: { count: 0, limit: 10 } });
    expect((await post({ businessName: 'Sweet Co', city: 'Austin' })).status).toBe(402);
  });
  it('runs with the page details, dropping an unknown state', async () => {
    on();
    const res = await post({ businessName: 'Sweet Co', city: 'Austin', state: 'ZZ', service: 'wedding cakes', url: 'sweetco.com', page: { phone: '512' } });
    expect(res.status).toBe(200);
    expect(runListingCheck).toHaveBeenCalledWith({
      businessName: 'Sweet Co', city: 'Austin', state: null, service: 'wedding cakes',
      page: { name: 'Sweet Co', phone: '512', street: '', url: 'https://sweetco.com' },
    });
  });
  it('needs a business name and city', async () => {
    on();
    expect((await post({ businessName: 'S', city: '' })).status).toBe(400);
  });
});
