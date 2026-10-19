import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const findUserByApiKey = vi.fn();
const saveCitationCheck = vi.fn();
const findRecentCitationCheck = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...a: unknown[]) => findUserByApiKey(...a),
  saveCitationCheck: (...a: unknown[]) => saveCitationCheck(...a),
  findRecentCitationCheck: (...a: unknown[]) => findRecentCitationCheck(...a),
}));
const runEngineCitationCheck = vi.fn();
vi.mock('../services/engines/cloro', () => ({
  runEngineCitationCheck: (...a: unknown[]) => runEngineCitationCheck(...a),
  EngineError: class extends Error {},
}));
vi.mock('../services/engines', () => ({ availableEngines: () => [{ id: 'gemini', label: 'Gemini' }, { id: 'chatgpt', label: 'ChatGPT' }] }));
vi.mock('../services/citationCheckService', () => ({ findCitedSourceIndex: () => -1, extractDomain: (u: string) => u }));

let app: express.Express;
beforeAll(async () => {
  const m = await import('../api/engine-check');
  app = express();
  app.use(express.json());
  app.get('/engines', m.enginesHandler);
  app.post('/start', m.startHandler);
  app.get('/poll/:id', m.pollHandler);
});
const user = { id: 'u1', email: 'u@x.com', locationState: 'TX' };
beforeEach(() => {
  findUserByApiKey.mockReset().mockResolvedValue(user);
  saveCitationCheck.mockReset().mockResolvedValue({ id: 99 });
  findRecentCitationCheck.mockReset().mockResolvedValue(null);
  runEngineCitationCheck.mockReset();
});
const auth = (r: request.Test) => r.set('Authorization', 'Bearer k');

describe('engine checks', () => {
  it('lists available engines', async () => {
    const res = await auth(request(app).get('/engines'));
    expect(res.body.engines.map((e: any) => e.id)).toEqual(['gemini', 'chatgpt']);
  });
  it('reuses a check from the last 24 hours without asking the AI again', async () => {
    findRecentCitationCheck.mockResolvedValue({ id: 5, topic: 'q?', url: null, cited: false, sources: [], engine: 'chatgpt', checkedAt: 'x' });
    const res = await auth(request(app).post('/start').send({ engine: 'chatgpt', topic: 'best bakery in Austin' }));
    expect(res.body).toMatchObject({ status: 'done', reused: true });
    expect(runEngineCitationCheck).not.toHaveBeenCalled();
  });
  it("runs in the background from the user's state, saves, and can be polled", async () => {
    runEngineCitationCheck.mockResolvedValue({ topic: 'best bakery in Austin', url: null, cited: false, sources: [], summary: 's' });
    const start = await auth(request(app).post('/start').send({ engine: 'chatgpt', topic: 'best bakery in Austin' }));
    expect(start.status).toBe(202);
    expect(runEngineCitationCheck).toHaveBeenCalledWith('chatgpt', 'best bakery in Austin', null, 'TX');
    await new Promise(r => setTimeout(r, 10));
    const poll = await auth(request(app).get(`/poll/${start.body.jobId}`));
    expect(poll.body.status).toBe('done');
    expect(poll.body.result.checkId).toBe(99);
    expect(saveCitationCheck).toHaveBeenCalledWith('u1', expect.objectContaining({ engine: 'chatgpt' }));
  });
  it('refuses Gemini and unknown engines here', async () => {
    expect((await auth(request(app).post('/start').send({ engine: 'gemini', topic: 'abc def' }))).status).toBe(400);
    expect((await auth(request(app).post('/start').send({ engine: 'nope', topic: 'abc def' }))).status).toBe(400);
  });
  it("does not show another user's job", async () => {
    runEngineCitationCheck.mockResolvedValue({ topic: 't', url: null, cited: false, sources: [], summary: '' });
    const start = await auth(request(app).post('/start').send({ engine: 'chatgpt', topic: 'another question' }));
    findUserByApiKey.mockResolvedValue({ id: 'u2', email: 'b@x.com' });
    expect((await auth(request(app).get(`/poll/${start.body.jobId}`))).status).toBe(404);
  });
});
