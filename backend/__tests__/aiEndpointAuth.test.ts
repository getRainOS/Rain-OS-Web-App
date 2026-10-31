import { describe, it, expect, vi, beforeEach } from 'vitest';

const findUserByApiKey = vi.fn();
vi.mock('../services/dbService', () => ({ findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args) }));

const upsertAiContentProfileFromNormalize = vi.fn(async () => {});
const getOrComputeAiReadinessAnalysis = vi.fn(async () => null);
const getAiReadinessDiagnostics = vi.fn(async () => null);
vi.mock('../services/aiReadiness/analysisService', () => ({
  upsertAiContentProfileFromNormalize: (...args: unknown[]) => upsertAiContentProfileFromNormalize(...args),
  getOrComputeAiReadinessAnalysis: (...args: unknown[]) => getOrComputeAiReadinessAnalysis(...args),
  getAiReadinessDiagnostics: (...args: unknown[]) => getAiReadinessDiagnostics(...args),
}));

import normalize from '../api/ai/normalize';
import content from '../api/ai/content';
import diagnostics from '../api/ai/diagnostics';

function fakeRes() {
  const res: any = { statusCode: 200, body: undefined };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.send = () => res;
  return res;
}

function fakeReq(opts: { auth?: string; params?: Record<string, string>; body?: unknown } = {}) {
  return {
    headers: opts.auth ? { authorization: opts.auth } : {},
    params: opts.params || {},
    body: opts.body || {},
  } as any;
}

describe('AI readiness endpoints require an API key', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuses a profile write without a key and writes nothing', async () => {
    const res = fakeRes();
    await normalize(fakeReq({ body: { contentId: 'page-1', text: 'Hello' } }), res);

    expect(res.statusCode).toBe(401);
    expect(upsertAiContentProfileFromNormalize).not.toHaveBeenCalled();
  });

  it('refuses a profile write with an unknown key', async () => {
    findUserByApiKey.mockResolvedValue(null);
    const res = fakeRes();
    await normalize(fakeReq({ auth: 'Bearer nope', body: { contentId: 'page-1', text: 'Hello' } }), res);

    expect(res.statusCode).toBe(401);
    expect(upsertAiContentProfileFromNormalize).not.toHaveBeenCalled();
  });

  it('accepts a profile write with a valid key', async () => {
    findUserByApiKey.mockResolvedValue({ id: 'user-1' });
    const res = fakeRes();
    await normalize(fakeReq({ auth: 'Bearer good', body: { contentId: 'page-1', text: 'Hello' } }), res);

    expect(res.statusCode).toBe(202);
    expect(upsertAiContentProfileFromNormalize).toHaveBeenCalledTimes(1);
  });

  it('refuses reads of stored scores without a key', async () => {
    const res = fakeRes();
    await content(fakeReq({ params: { contentId: 'page-1' } }), res);

    expect(res.statusCode).toBe(401);
    expect(getOrComputeAiReadinessAnalysis).not.toHaveBeenCalled();
  });

  it('refuses reads of diagnostics without a key', async () => {
    const res = fakeRes();
    await diagnostics(fakeReq({ params: { contentId: 'page-1' } }), res);

    expect(res.statusCode).toBe(401);
    expect(getAiReadinessDiagnostics).not.toHaveBeenCalled();
  });
});
