import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cloroAnswer, EngineError } from '../services/engines/cloro';

describe('cloro errors shown to users', () => {
  beforeEach(() => {
    process.env.CLORO_API_KEY = 'test-key';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not pass the vendor message, which can name credits or accounts, to the user', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(
      JSON.stringify({ success: false, error: { code: 'INSUFFICIENT_CREDITS', message: 'Account acct_123 has 0 credits left' } }),
      { status: 402 }
    ))));
    const err = await cloroAnswer('chatgpt', 'best plumber').catch(e => e);
    expect(err).toBeInstanceOf(EngineError);
    expect(err.message).not.toContain('acct_123');
    expect(err.message).not.toContain('credits');
    expect(err.message).toContain('could not complete this check');
    expect(err.status).toBe(502);
  });

  it('keeps the friendly message for provider outages', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(
      JSON.stringify({ success: false, error: { code: 'MODEL_UNAVAILABLE', message: 'upstream down' } }),
      { status: 503 }
    ))));
    const err = await cloroAnswer('chatgpt', 'best plumber').catch(e => e);
    expect(err.status).toBe(503);
    expect(err.message).toContain('temporarily unavailable');
  });
});
