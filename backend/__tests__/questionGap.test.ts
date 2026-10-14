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

import { parseQuestionGap, buildPrompt, MAX_ACTIONS, type GapInput } from '../services/questionGapService';
import { createDailyLimiter } from '../services/dailyLimiter';

const user: User = {
  id: 'u1', email: 'u@example.com', apiKey: 'k', subscriptionStatus: 'active',
  usage: { count: 0, limit: 5 }, createdAt: new Date(), emailConfirmed: true,
};

const goodReply = JSON.stringify({
  headline: 'Your page never answers the question directly.',
  pageRead: true,
  whatCitedPagesDo: ['They open with the price range.', 'They list services in a table.'],
  actions: [
    { pillar: 'AI Readability', where: 'on_page', title: 'Answer first', why: 'Cited pages do.', fix: 'Open with a two-sentence answer.' },
    { pillar: 'Digital Authority', where: 'off_site', title: 'Get on yelp.com', why: 'It is cited #2.', fix: 'Claim and complete your profile.' },
  ],
  draftAnswer: 'A wedding cake in [your city] costs [your price].',
});

describe('parseQuestionGap', () => {
  it('reads JSON wrapped in prose and fences', () => {
    const out = parseQuestionGap('Here you go:\n```json\n' + goodReply + '\n```');
    expect(out?.actions).toHaveLength(2);
    expect(out?.pageRead).toBe(true);
    expect(out?.draftAnswer).toContain('[your city]');
  });

  it('normalises unknown pillars and locations, and caps actions', () => {
    const actions = Array.from({ length: 10 }, (_, i) => ({ pillar: 'Nonsense', where: 'elsewhere', title: `t${i}`, fix: `f${i}` }));
    const out = parseQuestionGap(JSON.stringify({ actions }));
    expect(out?.actions).toHaveLength(MAX_ACTIONS);
    expect(out?.actions[0].pillar).toBe('AI Readability');
    expect(out?.actions[0].where).toBe('on_page');
  });

  it('returns null without usable actions or JSON', () => {
    expect(parseQuestionGap('nothing')).toBeNull();
    expect(parseQuestionGap('{"actions":[{"title":"x"}]}')).toBeNull();
  });

  it('only trusts pageRead when it is literally true', () => {
    const out = parseQuestionGap(JSON.stringify({ pageRead: 'yes', actions: [{ title: 't', fix: 'f' }] }));
    expect(out?.pageRead).toBe(false);
  });
});

describe('buildPrompt', () => {
  const base: GapInput = {
    question: 'best bakery for weddings', mode: 'citation', brand: null, domain: null, content: null,
    sources: [{ domain: 'theknot.com', title: 'Best bakeries', snippet: 'Top picks' }], competitors: [], cited: null, rank: null, note: null,
  };

  it('says the result is unknown without a site and lists the real sources', () => {
    const p = buildPrompt(base);
    expect(p).toContain('Unknown, because no website was given');
    expect(p).toContain('1. theknot.com | Best bakeries | "Top picks"');
    expect(p).toContain('THEIR PAGE: not provided');
  });

  it('asks the model to look the page up only when a site is given without content', () => {
    expect(buildPrompt({ ...base, domain: 'acme.com', cited: false })).toContain('Look up acme.com yourself');
    const withContent = buildPrompt({ ...base, domain: 'acme.com', content: 'My cakes start at $90.', cited: true, rank: 2 });
    expect(withContent).toContain('My cakes start at $90.');
    expect(withContent).toContain('position 2 of 1');
    expect(withContent).not.toContain('Look up acme.com yourself');
  });

  it('forbids invented facts', () => {
    expect(buildPrompt(base)).toContain('Never invent facts');
  });
});

describe('createDailyLimiter', () => {
  it('allows the limit then blocks, and frees slots after a day', () => {
    const take = createDailyLimiter(2);
    expect(take('a', 0)).toBe(true);
    expect(take('a', 1)).toBe(true);
    expect(take('a', 2)).toBe(false);
    expect(take('b', 2)).toBe(true);
    expect(take('a', 24 * 60 * 60 * 1000 + 5)).toBe(true);
  });
});

describe('POST /api/question-gap', () => {
  let app: express.Express;
  beforeAll(async () => {
    const h = (await import('../api/question-gap')).default;
    app = express();
    app.use(express.json());
    app.post('/api/question-gap', h);
  });
  beforeEach(() => {
    findUserByApiKey.mockReset();
    getGenerativeModel.mockReset();
    generateContent.mockClear();
    replyText = goodReply;
  });

  it('requires an API key', async () => {
    const res = await request(app).post('/api/question-gap').send({ question: 'best bakery for weddings' });
    expect(res.status).toBe(401);
  });

  it('rejects a missing question', async () => {
    findUserByApiKey.mockResolvedValue(user);
    const res = await request(app).post('/api/question-gap').set('Authorization', 'Bearer k').send({});
    expect(res.status).toBe(400);
  });

  it('derives cited and rank on the server from the sources, ignoring the client', async () => {
    findUserByApiKey.mockResolvedValue(user);
    const res = await request(app).post('/api/question-gap').set('Authorization', 'Bearer k').send({
      question: 'best bakery for weddings', url: 'https://www.acme.com/cakes', cited: false,
      sources: [{ domain: 'theknot.com' }, { domain: 'www.acme.com', title: 'Acme' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.cited).toBe(true);
    expect(res.body.rank).toBe(2);
  });

  it('reports cited as unknown without a site', async () => {
    findUserByApiKey.mockResolvedValue(user);
    const res = await request(app).post('/api/question-gap').set('Authorization', 'Bearer k').send({
      question: 'best bakery for weddings', sources: [{ domain: 'theknot.com' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.cited).toBeNull();
  });

  it('does not claim a match when the site is a page on a shared platform', async () => {
    findUserByApiKey.mockResolvedValue(user);
    const res = await request(app).post('/api/question-gap').set('Authorization', 'Bearer k').send({
      question: 'best bakery for weddings', url: 'https://www.facebook.com/theirbakery',
      sources: [{ domain: 'facebook.com' }, { domain: 'theknot.com' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.cited).toBeNull();
    expect(res.body.siteShared).toBe(true);
  });

  it('uses grounding only when a site is given without pasted content', async () => {
    findUserByApiKey.mockResolvedValue(user);
    await request(app).post('/api/question-gap').set('Authorization', 'Bearer k')
      .send({ question: 'best bakery for weddings', url: 'acme.com' });
    expect(getGenerativeModel.mock.calls[0][0]).toHaveProperty('tools');
    getGenerativeModel.mockReset();
    await request(app).post('/api/question-gap').set('Authorization', 'Bearer k')
      .send({ question: 'best bakery for weddings', url: 'acme.com', content: 'We bake cakes.' });
    expect(getGenerativeModel.mock.calls[0][0]).not.toHaveProperty('tools');
  });

  it('returns 502 when the model reply has no usable advice', async () => {
    findUserByApiKey.mockResolvedValue(user);
    replyText = 'sorry';
    const res = await request(app).post('/api/question-gap').set('Authorization', 'Bearer k')
      .send({ question: 'best bakery for weddings' });
    expect(res.status).toBe(502);
  });
});
