import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { costlyLimiter } from '../services/costlyLimiter';

function makeApp() {
  const app = express();
  app.post('/costly', costlyLimiter, (_req, res) => res.json({ ok: true }));
  return app;
}

describe('costlyLimiter', () => {
  it('lets a key make 20 calls a minute and then refuses', async () => {
    const app = makeApp();
    for (let i = 0; i < 20; i++) {
      await request(app).post('/costly').set('Authorization', 'Bearer key-a').expect(200);
    }
    await request(app).post('/costly').set('Authorization', 'Bearer key-a').expect(429);
  });

  it('counts each key separately', async () => {
    const app = makeApp();
    for (let i = 0; i < 20; i++) {
      await request(app).post('/costly').set('Authorization', 'Bearer key-b').expect(200);
    }
    await request(app).post('/costly').set('Authorization', 'Bearer key-c').expect(200);
  });
});
