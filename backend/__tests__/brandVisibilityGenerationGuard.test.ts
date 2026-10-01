import { describe, it, expect, beforeAll, vi } from 'vitest';

// ─── Mock the @google/generative-ai SDK, preserving the real FinishReason
// enum (the service compares against FinishReason.STOP at runtime) ───────────
let finishReason: string | undefined;

const generateContent = vi.fn(async () => ({
  response: {
    text: () => 'Partial answer text before being cut off',
    candidates: [
      {
        finishReason,
        groundingMetadata: { groundingChunks: [], groundingSupports: [] },
      },
    ],
  },
}));

vi.mock('@google/generative-ai', async () => {
  const actual = await vi.importActual<typeof import('@google/generative-ai')>('@google/generative-ai');
  return {
    ...actual,
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return { generateContent };
      }
    },
  };
});

// ─── Set GEMINI_API_KEY and dynamically import after the mock is in place ────
process.env.GEMINI_API_KEY = 'test-key';

let runBrandVisibilityCheck: typeof import('../services/brandVisibilityService').runBrandVisibilityCheck;
let GenerationIncompleteError: typeof import('../services/brandVisibilityService').GenerationIncompleteError;

beforeAll(async () => {
  const mod = await import('../services/brandVisibilityService');
  runBrandVisibilityCheck = mod.runBrandVisibilityCheck;
  GenerationIncompleteError = mod.GenerationIncompleteError;
});

describe('runBrandVisibilityCheck — finishReason guard', () => {
  it('throws GenerationIncompleteError when finishReason is RECITATION, instead of a false "not mentioned"', async () => {
    finishReason = 'RECITATION';

    await expect(runBrandVisibilityCheck('Acme', 'best widgets', null))
      .rejects.toBeInstanceOf(GenerationIncompleteError);
  });

  it('carries the finishReason on the thrown error', async () => {
    finishReason = 'SAFETY';

    await expect(runBrandVisibilityCheck('Acme', 'best widgets', null))
      .rejects.toMatchObject({ finishReason: 'SAFETY' });
  });

  it('proceeds normally when finishReason is STOP', async () => {
    finishReason = 'STOP';

    const result = await runBrandVisibilityCheck('Acme', 'best widgets', null);
    expect(result.mentionStatus).toBe('not_mentioned');
  });
});
