import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

process.env.GEMINI_API_KEY = 'test-key';

const findUserByApiKey = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...a: unknown[]) => findUserByApiKey(...a),
}));

let replyText = '';
const getGenerativeModel = vi.fn();
const generateContent = vi.fn(async () => ({ response: { text: () => replyText } }));
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel(opts: unknown) {
      getGenerativeModel(opts);
      return { generateContent };
    }
  },
}));

import { parseSuggestions, buildPrompt, MAX_SUGGESTIONS } from '../services/promptSuggestionService';

const user: User = {
  id: 'u1', email: 'u@example.com', apiKey: 'k', subscriptionStatus: 'active',
  usage: { count: 0, limit: 5 }, createdAt: new Date(), emailConfirmed: true,
};

describe('parseSuggestions', () => {
  it('reads a JSON array wrapped in prose and code fences', () => {
    const out = parseSuggestions('Sure!\n```json\n[{"question":"best roofer in austin for hail damage","intent":"decide"}]\n```');
    expect(out).toEqual([{ question: 'best roofer in austin for hail damage', intent: 'decide' }]);
  });

  it('dedupes, drops junk and caps the list', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ question: `what is the best option number ${i}`, intent: 'learn' }));
    const out = parseSuggestions(JSON.stringify([{ question: 'hi' }, { question: 'What is the best option number 0' }, ...many]));
    expect(out.length).toBe(MAX_SUGGESTIONS);
    expect(out.filter(s => s.question.toLowerCase() === 'what is the best option number 0').length).toBe(1);
  });

  it('defaults an unknown intent and accepts plain strings', () => {
    expect(parseSuggestions('["how do I fix a leaking faucet fast"]')).toEqual([{ question: 'how do I fix a leaking faucet fast', intent: 'discover' }]);
  });

  it('returns nothing for unparseable replies', () => {
    expect(parseSuggestions('no json here')).toEqual([]);
  });
});

describe('buildPrompt', () => {
  it('tells the model not to name the business and to use the location', () => {
    const p = buildPrompt({ domain: 'acme.com', description: null, location: 'Austin, TX', lane: 'local_business' });
    expect(p).toContain('acme.com');
    expect(p).toContain("Do not include the business's own name");
    expect(p).toContain('Austin, TX');
    expect(p).toContain('Look the website up');
  });
});

describe('POST /api/prompt-suggestions', () => {
  let app: express.Express;
  beforeAll(async () => {
    const h = (await import('../api/prompt-suggestions')).default;
    app = express();
    app.use(express.json());
    app.post('/api/prompt-suggestions', h);
  });
  beforeEach(() => {
    findUserByApiKey.mockReset();
    getGenerativeModel.mockReset();
    generateContent.mockClear();
    replyText = '[{"question":"best project tool for small agencies","intent":"compare"}]';
  });

  it('requires an API key', async () => {
    const res = await request(app).post('/api/prompt-suggestions').send({ description: 'x' });
    expect(res.status).toBe(401);
  });

  it('requires a website or a description', async () => {
    findUserByApiKey.mockResolvedValue(user);
    const res = await request(app).post('/api/prompt-suggestions').set('Authorization', 'Bearer k').send({});
    expect(res.status).toBe(400);
  });

  it('uses search grounding only when there is no description', async () => {
    findUserByApiKey.mockResolvedValue(user);
    await request(app).post('/api/prompt-suggestions').set('Authorization', 'Bearer k').send({ url: 'acme.com' });
    expect((getGenerativeModel.mock.calls[0][0] as any).tools).toBeDefined();
    await request(app).post('/api/prompt-suggestions').set('Authorization', 'Bearer k').send({ url: 'acme.com', description: 'roofing' });
    expect((getGenerativeModel.mock.calls[1][0] as any).tools).toBeUndefined();
  });

  it('returns suggestions', async () => {
    findUserByApiKey.mockResolvedValue({ ...user, id: 'u2' });
    const res = await request(app).post('/api/prompt-suggestions').set('Authorization', 'Bearer k').send({ description: 'project software', lane: 'general' });
    expect(res.status).toBe(200);
    expect(res.body.suggestions[0].question).toBe('best project tool for small agencies');
  });

  it('caps each user at 20 requests a day', async () => {
    findUserByApiKey.mockResolvedValue({ ...user, id: 'u3' });
    for (let i = 0; i < 20; i++) {
      await request(app).post('/api/prompt-suggestions').set('Authorization', 'Bearer k').send({ description: 'x shop' });
    }
    const res = await request(app).post('/api/prompt-suggestions').set('Authorization', 'Bearer k').send({ description: 'x shop' });
    expect(res.status).toBe(429);
  });
});
