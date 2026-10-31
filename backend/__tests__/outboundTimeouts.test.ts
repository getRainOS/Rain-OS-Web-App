import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendEmail } from '../services/emailService';

// Outbound calls must give up on their own. Without a timeout, one stuck
// request can hold the weekly scheduler "running" and stop every later tick.
describe('outbound request timeouts', () => {
  const originalKey = process.env.RESEND_API_KEY;

  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{}', { status: 200 }))));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.RESEND_API_KEY = originalKey;
  });

  it('gives the email provider call an abort signal', async () => {
    await sendEmail('owner@example.com', 'Hello', '<p>Hi</p>');

    const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
});
