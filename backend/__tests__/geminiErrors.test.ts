import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyGeminiError } from '../services/geminiErrors';

describe('classifyGeminiError', () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errSpy.mockRestore();
  });

  it('classifies a 429 status as ai_provider_busy with a 503 and no counted-usage disclaimer', () => {
    const err = Object.assign(new Error('Too Many Requests'), { status: 429 });
    const result = classifyGeminiError(err, 'test');
    expect(result.status).toBe(503);
    expect(result.body.error).toBe('ai_provider_busy');
    expect(result.body.message).toMatch(/temporarily at capacity/i);
    expect(result.body.message).toMatch(/not counted against your usage/i);
  });

  it('classifies an object-shaped error with status 429 (no Error instance) the same way', () => {
    const err = {
      status: 429,
      message: JSON.stringify({
        error: {
          code: 429,
          message: 'Quota exceeded for quota metric...',
          status: 'RESOURCE_EXHAUSTED',
          details: [
            {
              '@type': 'type.googleapis.com/google.rpc.QuotaFailure',
              violations: [{ quotaMetric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests', quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }],
            },
          ],
        },
      }),
    };
    const result = classifyGeminiError(err, 'test');
    expect(result.status).toBe(503);
    expect(result.body.error).toBe('ai_provider_busy');
  });

  it('classifies a RESOURCE_EXHAUSTED message without an explicit status field as quota', () => {
    const err = new Error('9 RESOURCE_EXHAUSTED: Resource has been exhausted (e.g. check quota).');
    const result = classifyGeminiError(err, 'test');
    expect(result.status).toBe(503);
    expect(result.body.error).toBe('ai_provider_busy');
  });

  it('classifies a generic/unknown error as ai_provider_error with a 502', () => {
    const err = new Error('Gemini request timed out');
    const result = classifyGeminiError(err, 'test');
    expect(result.status).toBe(502);
    expect(result.body.error).toBe('ai_provider_error');
    expect(result.body.message).toMatch(/AI provider returned an error/i);
    expect(result.body.message).toMatch(/not counted against your usage/i);
  });

  it('classifies a 500 upstream failure as ai_provider_error', () => {
    const err = Object.assign(new Error('Internal Server Error'), { status: 500 });
    const result = classifyGeminiError(err, 'test');
    expect(result.status).toBe(502);
    expect(result.body.error).toBe('ai_provider_error');
  });

  it('never leaks upstream error text into the returned message', () => {
    const upstreamText = 'super secret upstream diagnostic detail 12345';
    const err = new Error(upstreamText);
    const result = classifyGeminiError(err, 'test');
    expect(result.body.message).not.toContain(upstreamText);
    expect(JSON.stringify(result.body)).not.toContain(upstreamText);
  });

  it('never leaks a Google API key (AIza... pattern) embedded in the error into the returned message', () => {
    const fakeKey = 'AIzaSyD' + 'x'.repeat(32); // 39 chars total, matches AIza + 35
    const err = new Error(`fetch failed for https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${fakeKey}`);
    const result = classifyGeminiError(err, 'test');
    expect(result.body.message).not.toContain(fakeKey);
    expect(JSON.stringify(result.body)).not.toContain(fakeKey);
  });

  it('redacts a Google API key from what gets logged server-side', () => {
    const fakeKey = 'AIzaSyD' + 'y'.repeat(32);
    const err = new Error(`request to https://generativelanguage.googleapis.com/v1/models/x?key=${fakeKey} failed`);
    classifyGeminiError(err, 'test');
    expect(errSpy).toHaveBeenCalled();
    const loggedArgs = errSpy.mock.calls.flat().map(a => String(a));
    const loggedText = loggedArgs.join(' ');
    expect(loggedText).not.toContain(fakeKey);
  });

  it('logs the quota metric/ID when present, for server-side diagnosis', () => {
    const err = {
      status: 429,
      errorDetails: [
        { violations: [{ quotaMetric: 'my.quota.metric', quotaId: 'my-quota-id' }] },
      ],
      message: 'Quota exceeded',
    };
    classifyGeminiError(err, 'test-tag');
    const loggedText = errSpy.mock.calls.flat().map(a => String(a)).join(' ');
    expect(loggedText).toContain('my.quota.metric');
    expect(loggedText).toContain('my-quota-id');
    expect(loggedText).toContain('test-tag');
  });

  it('handles a non-Error thrown value without throwing itself', () => {
    expect(() => classifyGeminiError('a plain string failure', 'test')).not.toThrow();
    expect(() => classifyGeminiError(undefined, 'test')).not.toThrow();
    expect(() => classifyGeminiError({ weird: 'shape' }, 'test')).not.toThrow();
  });
});
