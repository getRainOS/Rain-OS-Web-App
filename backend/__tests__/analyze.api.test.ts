import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const incrementUserUsage = vi.fn();
const saveAnalysis = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  incrementUserUsage: (...args: unknown[]) => incrementUserUsage(...args),
  saveAnalysis: (...args: unknown[]) => saveAnalysis(...args),
}));

// ─── Mock geminiService so analyzeContent is deterministic ───────────────────
const analyzeContent = vi.fn();
vi.mock('../services/geminiService', () => ({
  analyzeContent: (...args: unknown[]) => analyzeContent(...args),
  API_VERSION: '2.3',
}));

// ─── Build the express app under test ────────────────────────────────────────
let app: express.Express;
beforeAll(async () => {
  const { handleAnalyze } = await import('../services/analyzeController');
  app = express();
  app.use(express.json());
  app.post('/api/analyze', handleAnalyze);
});

const baseUser: User = {
  id: 'user-1',
  email: 'u@example.com',
  apiKey: 'k',
  subscriptionStatus: 'active',
  usage: { count: 0, limit: 100 },
  createdAt: new Date(),
};

function defaultGeminiResponse() {
  return {
    overallScore: 78,
    pillarScores: {
      aiReadability: 80,
      digitalAuthority: 75,
      conversionReadiness: 70,
      productDiscoverability: 65,
      ragReadiness: 72,
    },
    subScores: [
      { category: 'Semantic Clarity', score: 80 },
      { category: 'Readability', score: 75 },
    ],
    recommendations: ['Add FAQ schema', 'Improve internal linking'],
    summary: 'Well-optimized content.',
  };
}

beforeEach(() => {
  findUserByApiKey.mockReset();
  incrementUserUsage.mockReset();
  saveAnalysis.mockReset();
  analyzeContent.mockReset();
  analyzeContent.mockResolvedValue(defaultGeminiResponse());
  saveAnalysis.mockResolvedValue(undefined);
});

// ─── Auth & Usage Gating ──────────────────────────────────────────────────────
describe('POST /api/analyze — auth & usage gating', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ content: 'This is a long enough content string.' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(res.body.message).toMatch(/API key missing/i);
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key does not match any user', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer bad-key')
      .send({ content: 'This is a long enough content string.' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(res.body.message).toMatch(/Invalid API key/i);
  });

  it('returns 402 when the user subscription is not active', async () => {
    findUserByApiKey.mockResolvedValueOnce({
      ...baseUser,
      subscriptionStatus: 'inactive',
    });

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a long enough content string.' });

    expect(res.status).toBe(402);
    expect(res.body.error).toBe('payment_required');
    expect(analyzeContent).not.toHaveBeenCalled();
    expect(incrementUserUsage).not.toHaveBeenCalled();
  });

  it('returns 429 when the user has hit their monthly usage limit', async () => {
    findUserByApiKey.mockResolvedValueOnce({
      ...baseUser,
      usage: { count: 100, limit: 100 },
    });

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a long enough content string.' });

    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limit_exceeded');
    expect(analyzeContent).not.toHaveBeenCalled();
    expect(incrementUserUsage).not.toHaveBeenCalled();
  });
});

// ─── Input Validation ─────────────────────────────────────────────────────────
describe('POST /api/analyze — input validation', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 400 when content is missing', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(res.body.message).toMatch(/content is required/i);
    expect(analyzeContent).not.toHaveBeenCalled();
  });

  it('returns 400 when content is fewer than 10 characters', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(res.body.message).toMatch(/content is required/i);
    expect(analyzeContent).not.toHaveBeenCalled();
  });

  it('returns 400 when content is not a string', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 12345 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(analyzeContent).not.toHaveBeenCalled();
  });
});

// ─── Happy Path ───────────────────────────────────────────────────────────────
describe('POST /api/analyze — happy path', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    incrementUserUsage.mockResolvedValue({
      ...baseUser,
      usage: { count: 1, limit: 100 },
    });
  });

  it('returns 200, increments usage, sets X-Usage-Info, and returns success shape', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.', industry: 'SaaS' });

    expect(res.status).toBe(200);

    expect(analyzeContent).toHaveBeenCalledTimes(1);
    const [contentArg, industryArg] = analyzeContent.mock.calls[0];
    expect(typeof contentArg).toBe('string');
    expect(industryArg).toBe('SaaS');

    expect(incrementUserUsage).toHaveBeenCalledTimes(1);
    expect(incrementUserUsage).toHaveBeenCalledWith('user-1');

    const usageHeader = res.headers['x-usage-info'];
    expect(usageHeader).toBeTruthy();
    expect(JSON.parse(usageHeader)).toEqual({ count: 1, limit: 100 });

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.overallScore).toBe(78);
  });

  it('defaults industry to "General / Other" when not provided', async () => {
    await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.' });

    expect(analyzeContent).toHaveBeenCalledTimes(1);
    expect(analyzeContent.mock.calls[0][1]).toBe('General / Other');
  });

  it('persists the analysis result via saveAnalysis (best-effort)', async () => {
    await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.', industry: 'Healthcare' });

    expect(saveAnalysis).toHaveBeenCalledTimes(1);
    const [userId, payload] = saveAnalysis.mock.calls[0];
    expect(userId).toBe('user-1');
    expect(payload.overall_score).toBe(78);
    expect(payload.ai_readability).toBe(80);
    expect(payload.digital_authority).toBe(75);
    expect(payload.conversion_readiness).toBe(70);
    expect(payload.rag_readiness).toBe(72);
    expect(payload.result_json).toBeDefined();
  });

  it('still returns 200 even when saveAnalysis throws (best-effort persistence)', async () => {
    saveAnalysis.mockRejectedValueOnce(new Error('db failure'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    errSpy.mockRestore();
  });

  it('does not set X-Usage-Info when incrementUserUsage returns null', async () => {
    incrementUserUsage.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.' });

    expect(res.status).toBe(200);
    expect(res.headers['x-usage-info']).toBeUndefined();
  });

  it('returns 500 when analyzeContent throws', async () => {
    analyzeContent.mockRejectedValueOnce(new Error('gemini boom'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
    expect(res.body.message).toMatch(/gemini boom/);
    expect(incrementUserUsage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

// ─── Unit tests for normalizeAnalyzeResultForWP helpers (via controller) ─────
describe('handleAnalyze — response shape', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    incrementUserUsage.mockResolvedValue({
      ...baseUser,
      usage: { count: 1, limit: 100 },
    });
  });

  it('spreads the Gemini result at top-level for backward compatibility', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.' });

    expect(res.status).toBe(200);
    expect(res.body.overallScore).toBe(78);
    expect(res.body.pillarScores).toBeDefined();
    expect(res.body.pillarScores.aiReadability).toBe(80);
  });

  it('handles a Gemini response that has no pillarScores gracefully', async () => {
    analyzeContent.mockResolvedValueOnce({
      overallScore: 55,
      recommendations: [],
      summary: 'Minimal response.',
    });

    const res = await request(app)
      .post('/api/analyze')
      .set('Authorization', 'Bearer k')
      .send({ content: 'This is a sufficiently long piece of content for analysis.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.overallScore).toBe(55);
  });
});
