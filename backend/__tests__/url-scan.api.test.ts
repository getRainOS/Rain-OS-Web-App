import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const incrementUserUsage = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  incrementUserUsage: (...args: unknown[]) => incrementUserUsage(...args),
}));

// ─── Mock the geminiService so analyzeContent is deterministic ───────────────
const analyzeContent = vi.fn();
vi.mock('../services/geminiService', () => ({
  analyzeContent: (...args: unknown[]) => analyzeContent(...args),
}));

// ─── Build the express app under test ────────────────────────────────────────
let app: express.Express;
beforeAll(async () => {
  const handler = (await import('../api/url-scan')).default;
  app = express();
  app.use(express.json());
  app.post('/api/url-scan', handler);
});

const baseUser: User = {
  id: 'user-1',
  email: 'u@example.com',
  apiKey: 'k',
  subscriptionStatus: 'active',
  usage: { count: 0, limit: 100 },
  createdAt: new Date(),
};

// HTML fixture used by the happy-path tests. Contains schema, semantic
// structure, headings, meta, OG, canonical, content, etc. — i.e. all the
// goodies — so we can verify that positive technical adjustments take effect.
const richHtml = `<!doctype html>
<html><head>
<title>Rich page</title>
<meta name="description" content="A long enough meta description for SEO." />
<link rel="canonical" href="https://target.test/" />
<meta property="og:title" content="t" />
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
})}</script>
</head><body>
<header>Header</header>
<main><article>
<h1>Title</h1>
<h2>Section</h2>
<p>${'word '.repeat(120)}</p>
<a href="/inside">Detailed internal page link</a>
</article></main>
<footer>Footer</footer>
</body></html>`;

// Default Gemini response shape — tests can mutate before sending requests.
function defaultGeminiResponse() {
  return {
    overallScore: 60,
    summary: 'ok',
    recommendations: [],
  };
}

// Reusable fetch mock. The handler calls fetch once for the target URL; the
// urlScanService also calls fetch once for /llms.txt. We dispatch by URL.
let targetResponse: Response;
let llmsTxtOk: boolean;
const fetchMock = vi.fn(async (input: any) => {
  const url = typeof input === 'string' ? input : input?.url || String(input);
  if (url.endsWith('/llms.txt')) {
    return new Response(null, { status: llmsTxtOk ? 200 : 404 });
  }
  return targetResponse;
});

beforeEach(() => {
  findUserByApiKey.mockReset();
  incrementUserUsage.mockReset();
  analyzeContent.mockReset();
  analyzeContent.mockResolvedValue(defaultGeminiResponse());
  targetResponse = new Response(richHtml, {
    status: 200,
    headers: { 'content-type': 'text/html' },
  });
  llmsTxtOk = false;
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/url-scan — auth & usage gating', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(app)
      .post('/api/url-scan')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key does not match a user', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer bad')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 402 when the user subscription is inactive', async () => {
    findUserByApiKey.mockResolvedValueOnce({ ...baseUser, subscriptionStatus: 'inactive' });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('payment_required');
    expect(analyzeContent).not.toHaveBeenCalled();
  });

  it('returns 429 when the user has hit their monthly usage limit', async () => {
    findUserByApiKey.mockResolvedValueOnce({
      ...baseUser,
      usage: { count: 100, limit: 100 },
    });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limit_exceeded');
    expect(analyzeContent).not.toHaveBeenCalled();
  });
});

describe('POST /api/url-scan — input validation', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 400 when url is missing', async () => {
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(res.body.message).toMatch(/url is required/i);
  });

  it('returns 400 when url is malformed', async () => {
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'not a url' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid URL/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/url-scan — fetch & content failures', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
  });

  it('returns 422 when the upstream URL returns a non-2xx status', async () => {
    targetResponse = new Response('nope', { status: 503 });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('fetch_failed');
    expect(res.body.message).toMatch(/HTTP 503/);
    expect(incrementUserUsage).not.toHaveBeenCalled();
  });

  it('returns 422 when fetching the URL throws (network error)', async () => {
    fetchMock.mockImplementationOnce(async () => {
      throw new Error('ECONNREFUSED');
    });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('fetch_failed');
    expect(res.body.message).toMatch(/ECONNREFUSED/);
  });

  it('returns 422 when the page has insufficient readable text', async () => {
    targetResponse = new Response('<html><body><p>tiny</p></body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('insufficient_content');
    expect(analyzeContent).not.toHaveBeenCalled();
    expect(incrementUserUsage).not.toHaveBeenCalled();
  });
});

describe('POST /api/url-scan — happy path', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    incrementUserUsage.mockResolvedValue({
      ...baseUser,
      usage: { count: 1, limit: 100 },
    });
  });

  it('returns 200, increments usage, sets X-Usage-Info, and merges Gemini + technical signals', async () => {
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/some/path', industry: 'SaaS' });

    expect(res.status).toBe(200);

    // Gemini was invoked with the extracted text and the supplied industry
    expect(analyzeContent).toHaveBeenCalledTimes(1);
    const [textArg, industryArg] = analyzeContent.mock.calls[0];
    expect(typeof textArg).toBe('string');
    expect((textArg as string).length).toBeGreaterThan(50);
    expect(industryArg).toBe('SaaS');

    // Usage was incremented exactly once and the header reflects the new usage
    expect(incrementUserUsage).toHaveBeenCalledTimes(1);
    expect(incrementUserUsage).toHaveBeenCalledWith('user-1');
    expect(JSON.parse(res.headers['x-usage-info'])).toEqual({ count: 1, limit: 100 });

    // Response shape: success flag, technical signals, recs, scan metadata
    expect(res.body.success).toBe(true);
    expect(res.body.technical_signals).toBeDefined();
    expect(res.body.technical_signals.hasFaqSchema).toBe(true);
    expect(res.body.technical_signals.hasSchemaMarkup).toBe(true);
    expect(res.body.technical_signals.hasMetaDescription).toBe(true);
    expect(Array.isArray(res.body.technical_recommendations)).toBe(true);
    expect(res.body.url_scanned).toBe('https://target.test/some/path');
    expect(typeof res.body.scan_timestamp).toBe('string');
    expect(res.body.raw).toEqual(defaultGeminiResponse());
  });

  it('defaults industry to "General / Other" when not provided', async () => {
    await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });

    expect(analyzeContent).toHaveBeenCalledTimes(1);
    expect(analyzeContent.mock.calls[0][1]).toBe('General / Other');
  });

  it('applies positive technical adjustments to the Gemini overallScore', async () => {
    // base score 50 → with rich HTML signals (schema + faq + meta + canonical
    // + og + semantic + heading hierarchy = +4+3+2+1+1+2+2 = +15) → 65
    analyzeContent.mockResolvedValueOnce({ overallScore: 50, summary: '', recommendations: [] });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });

    expect(res.status).toBe(200);
    expect(res.body.overallScore).toBeGreaterThan(50);
    expect(res.body.overallScore).toBeLessThanOrEqual(100);
  });

  it('clamps the adjusted score to the 0..100 range', async () => {
    analyzeContent.mockResolvedValueOnce({ overallScore: 99, summary: '', recommendations: [] });
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });

    expect(res.status).toBe(200);
    expect(res.body.overallScore).toBeLessThanOrEqual(100);
    expect(res.body.overallScore).toBeGreaterThanOrEqual(0);
  });

  it('returns 500 when Gemini analyzeContent throws', async () => {
    analyzeContent.mockRejectedValueOnce(new Error('gemini boom'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app)
      .post('/api/url-scan')
      .set('Authorization', 'Bearer k')
      .send({ url: 'https://target.test/' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
    expect(res.body.message).toMatch(/gemini boom/);
    expect(incrementUserUsage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
