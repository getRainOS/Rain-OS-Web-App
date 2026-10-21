import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

const askEngine = vi.fn();
vi.mock('../services/engines/run', () => ({ askEngine: (...a: unknown[]) => askEngine(...a) }));
vi.mock('../services/engines', () => ({
  engineLabel: (id: string) => ({ chatgpt: 'ChatGPT', ai_overviews: 'Google AI Overviews' } as any)[id] || id,
  availableEngines: () => [{ id: 'gemini' }, { id: 'chatgpt' }],
}));
vi.mock('../services/groundingUsage', () => ({ recordGroundedCall: () => {} }));

let runShareOfVoice: any;
let runBrandVisibilityCheck: any;
let requestedEngine: any;
beforeAll(async () => {
  process.env.GEMINI_API_KEY = 'test';
  ({ runShareOfVoice } = await import('../services/shareOfVoiceService'));
  ({ runBrandVisibilityCheck } = await import('../services/brandVisibilityService'));
  ({ requestedEngine } = await import('../services/engines/requestEngine'));
});
beforeEach(() => askEngine.mockReset());

const answer = (text: string, domains: string[] = [], shown = true) => ({
  text, shown, sources: domains.map(d => ({ title: d, url: `https://${d}/x`, domain: d, snippet: '' })),
});

describe('Share of Voice on another engine', () => {
  it('asks ChatGPT the 3 phrasings from the chosen place and counts mentions', async () => {
    askEngine
      .mockResolvedValueOnce(answer('Acme and Globex lead.', ['acme.com', 'g2.com']))
      .mockResolvedValueOnce(answer('I would pick Globex.', ['g2.com']))
      .mockResolvedValueOnce(answer('Acme, Globex and Initech.', ['acme.com']));
    const r = await runShareOfVoice('Acme', 'best widgets', 'https://acme.com', ['Globex'], 'chatgpt', { country: 'US', state: 'FL' });
    expect(askEngine).toHaveBeenCalledTimes(3);
    expect(askEngine.mock.calls[0][0]).toBe('chatgpt');
    expect(askEngine.mock.calls[0][2]).toMatchObject({ searchQuery: 'best widgets', country: 'US', state: 'FL' });
    expect(r.mentionedCount).toBe(2);
    expect(r.engine).toBe('chatgpt');
    expect(r.domainCitedCount).toBe(2);
    expect(r.modelResults.every((m: any) => !('shown' in m) && !('answerText' in m))).toBe(true);
  });

  it('asks Google AI Overviews the topic once, and says so in the summary', async () => {
    askEngine.mockResolvedValueOnce(answer('Acme is popular.', ['acme.com']));
    const r = await runShareOfVoice('Acme', 'best widgets', 'https://acme.com', ['Globex'], 'ai_overviews');
    expect(askEngine).toHaveBeenCalledTimes(1);
    expect(r.modelResults).toHaveLength(1);
    expect(r.summary).toContain('Acme was mentioned in the answer to "best widgets"');
  });

  it('reports plainly when Google gave no AI answer', async () => {
    askEngine.mockResolvedValueOnce(answer('', [], false));
    await expect(runShareOfVoice('Acme', 'best widgets', null, ['Globex'], 'ai_overviews')).rejects.toThrow(/gave no AI answer/);
  });
});

describe('Brand Sentiment on another engine', () => {
  it('reads mention and citation from the engine, naming it in the summary', async () => {
    askEngine.mockResolvedValueOnce(answer('Many people choose Globex for widgets.', ['g2.com', 'globex.com']));
    const r = await runBrandVisibilityCheck('Acme', 'best widgets', 'https://acme.com', 'chatgpt');
    expect(r.mentionStatus).toBe('not_mentioned');
    expect(r.sentiment).toBe('not_applicable');
    expect(r.cited).toBe(false);
    expect(r.summary).toMatch(/^ChatGPT did not mention Acme/);
  });
});

describe('requestedEngine', () => {
  it('defaults to Gemini and refuses engines that are off', () => {
    expect(requestedEngine({}, {})).toMatchObject({ engine: 'gemini' });
    expect(requestedEngine({ engine: 'perplexity' }, {})).toEqual({ error: 'That AI engine is not available.' });
    expect(requestedEngine({ engine: 'chatgpt', country: 'US' }, { locationState: 'TX' })).toMatchObject({ engine: 'chatgpt', location: { country: 'US', state: 'TX' } });
  });
});
