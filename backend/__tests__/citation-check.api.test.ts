import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Set GEMINI_API_KEY before importing the service ─────────────────────────
process.env.GEMINI_API_KEY = 'test-key';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const incrementUserUsage = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  incrementUserUsage: (...args: unknown[]) => incrementUserUsage(...args),
}));

// ─── Mock the @google/generative-ai SDK ──────────────────────────────────────
// Each test can override `groundedResponseText`, `analysisResponseText`, and
// `groundingChunks` to drive the citation logic.
let groundedResponseText = '';
let analysisResponseText = '';
let groundingChunks: Array<{ web: { uri: string; title: string } }> = [];

const generateContent = vi.fn(async (req: { contents: Array<{ parts: Array<{ text: string }> }> }) => {
  const promptText = req.contents?.[0]?.parts?.[0]?.text || '';
  // The analysis prompt always begins "You are an AEO" — use that to decide
  // which canned response to return.
  const isAnalysis = promptText.startsWith('You are an AEO');
  if (isAnalysis) {
    return {
      response: {
        text: () => analysisResponseText,
        candidates: [{}],
      },
    };
  }
  return {
    response: {
      text: () => groundedResponseText,
      candidates: [
        {
          groundingMetadata: {
            groundingChunks,
            groundingSupports: [],
          },
        },
      ],
    },
  };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

// ─── Build the express app under test ────────────────────────────────────────
let app: express.Express;
beforeAll(async () => {
  const handler = (await import('../api/citation-check')).default;
  app = express();
  app.use(express.json());
  app.post('/api/citation-check', handler);
});

const baseUser: User = {
  id: 'user-1',
  email: 'u@example.com',
  apiKey: 'k',
  subscriptionStatus: 'active',
  usage: { count: 0, limit: 100 },
  createdAt: new Date(),
};

beforeEach(() => {
  findUserByApiKey.mockReset();
  incrementUserUsage.mockReset();
  generateContent.mockClear();
  groundedResponseText = 'AI-generated answer about widgets.';
  analysisResponseText = JSON.stringify({
    alignmentScore: 82,
    summary: 'Your site is cited for this query.',
    recommendations: ['Add FAQ schema', 'Improve freshness', 'Internal linking'],
  });
  groundingChunks = [
    { web: { uri: 'https://example.com/widgets', title: 'Widgets Guide' } },
    { web: { uri: 'https://competitor.com/widgets', title: 'Competitor' } },
  ];
});

describe('POST /api/citation-check — auth & usage gating', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .send({ topic: 'best widgets 2026' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key does not match a user', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer bad')
      .send({ topic: 'best widgets 2026' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 402 when the user subscription is inactive', async () => {
    findUserByApiKey.mockResolvedValueOnce({ ...baseUser, subscriptionStatus: 'inactive' });
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'best widgets 2026' });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('payment_required');
  });

  it('returns 429 when the user has hit their monthly usage limit', async () => {
    findUserByApiKey.mockResolvedValueOnce({
      ...baseUser,
      usage: { count: 100, limit: 100 },
    });
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'best widgets 2026' });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limit_exceeded');
  });
});

describe('POST /api/citation-check — input validation', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 400 when topic is missing', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });

  it('returns 400 when topic is shorter than 3 characters', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'ab' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when topic is longer than 500 characters', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'a'.repeat(501) });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too long/i);
  });

  it('returns 400 when url is malformed', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'best widgets', url: 'http://[::bad-url' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/url is malformed/i);
  });
});

describe('POST /api/citation-check — happy path', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    incrementUserUsage.mockResolvedValue({
      ...baseUser,
      usage: { count: 1, limit: 100 },
    });
  });

  it('returns 200, increments usage, sets X-Usage-Info, and detects citation match', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'best widgets 2026', url: 'https://example.com' });

    expect(res.status).toBe(200);
    expect(incrementUserUsage).toHaveBeenCalledWith('user-1');

    const usageHeader = res.headers['x-usage-info'];
    expect(usageHeader).toBeTruthy();
    expect(JSON.parse(usageHeader)).toEqual({ count: 1, limit: 100 });

    expect(res.body.success).toBe(true);
    expect(res.body.cited).toBe(true);
    expect(res.body.citedSourceIndex).toBe(0);
    expect(res.body.alignmentScore).toBe(82);
    expect(res.body.sources).toHaveLength(2);
    expect(res.body.competitorDomains).toEqual(['competitor.com']);
    expect(res.body.recommendations).toHaveLength(3);
    expect(res.body.summary).toBe('Your site is cited for this query.');
  });

  it('marks cited=false and includes all domains as competitors when user domain is not in sources', async () => {
    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'best widgets 2026', url: 'https://mysite.test' });

    expect(res.status).toBe(200);
    expect(res.body.cited).toBe(false);
    expect(res.body.citedSourceIndex).toBeNull();
    expect(res.body.competitorDomains).toEqual(['example.com', 'competitor.com']);
  });

  it('falls back to default analysis values when Gemini returns malformed JSON', async () => {
    analysisResponseText = 'not-valid-json {{{';
    // Suppress the expected console.error from the parse-fallback path
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/citation-check')
      .set('Authorization', 'Bearer k')
      .send({ topic: 'best widgets 2026', url: 'https://example.com' });

    expect(res.status).toBe(200);
    expect(res.body.cited).toBe(true);
    // Fallback for cited=true is alignmentScore 75 and a topic-aware summary.
    expect(res.body.alignmentScore).toBe(75);
    expect(res.body.summary).toMatch(/best widgets 2026/);
    expect(res.body.recommendations.length).toBeGreaterThanOrEqual(3);

    errSpy.mockRestore();
  });
});
