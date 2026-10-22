import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const generate = vi.fn();
vi.mock('../services/geminiRetry', () => ({ generateContentWithRetry: (...a: unknown[]) => generate(...a) }));

const reply = (rewritten: string) => ({
  response: { text: () => JSON.stringify({ rewritten, changes: ['Answer-first intro'] }), candidates: [{ finishReason: 'STOP' }] },
});
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

let rewriteDocumentForAI: any;
beforeAll(async () => {
  process.env.GEMINI_API_KEY = 'test';
  ({ rewriteDocumentForAI } = await import('../services/geminiService'));
});
beforeEach(() => generate.mockReset());

describe('rewrite keeps its length', () => {
  it('accepts a rewrite of about the same length in one call', async () => {
    generate.mockResolvedValueOnce(reply(words(95)));
    const r = await rewriteDocumentForAI(words(100));
    expect(generate).toHaveBeenCalledTimes(1);
    expect(r.rewritten.split(' ')).toHaveLength(95);
  });

  it('asks again when the rewrite dropped content, and keeps the longer one', async () => {
    generate.mockResolvedValueOnce(reply(words(50))).mockResolvedValueOnce(reply(words(98)));
    const r = await rewriteDocumentForAI(words(100));
    expect(generate).toHaveBeenCalledTimes(2);
    const retryPrompt = generate.mock.calls[1][1].contents[0].parts[0].text;
    expect(retryPrompt).toContain('only 50% of the original length');
    expect(r.rewritten.split(' ')).toHaveLength(98);
  });

  it('keeps the first rewrite if the retry is even shorter', async () => {
    generate.mockResolvedValueOnce(reply(words(60))).mockResolvedValueOnce(reply(words(40)));
    const r = await rewriteDocumentForAI(words(100));
    expect(r.rewritten.split(' ')).toHaveLength(60);
  });

  it("passes the score's weak spots into the prompt", async () => {
    generate.mockResolvedValueOnce(reply(words(100)));
    await rewriteDocumentForAI(words(100), 'general', ['Answer-First Formatting scored 42/100']);
    expect(generate.mock.calls[0][1].contents[0].parts[0].text).toContain('- Answer-First Formatting scored 42/100');
  });

  it('holds the rewrite to the content type and lane rubric', async () => {
    generate.mockResolvedValueOnce(reply(words(100)));
    await rewriteDocumentForAI(words(100), 'product_sellers', [], 'Product Description');
    const prompt = generate.mock.calls[0][1].contents[0].parts[0].text;
    expect(prompt).toContain('CONTENT TYPE: Product Description');
    expect(prompt).toContain('Variant coverage');
  });

  it('passes verified product facts into the prompt', async () => {
    generate.mockResolvedValueOnce(reply(words(100)));
    await rewriteDocumentForAI(words(100), 'product_sellers', [], 'Product Description', 'VERIFIED PRODUCT FACTS FROM THE OWNER.\n- Price: 89 USD');
    expect(generate.mock.calls[0][1].contents[0].parts[0].text).toContain('- Price: 89 USD');
  });
});
