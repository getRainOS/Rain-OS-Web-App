// services/geminiRetry.ts — retries Gemini calls that fail for transient
// reasons (429 rate limit, 503 "high demand", timeouts) with a short backoff,
// so one busy moment on Google's side doesn't fail the user's check.
import type { GenerativeModel } from '@google/generative-ai';

export async function generateContentWithRetry(
  model: GenerativeModel,
  // any: some callers pass newer fields (e.g. thinkingConfig) the SDK types lack.
  request: any,
  { timeoutMs = 30000, maxRetries = 2 }: { timeoutMs?: number; maxRetries?: number } = {}
) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await Promise.race([
        model.generateContent(request),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timed out')), timeoutMs)
        ),
      ]);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const isRetryable = status === 429 || status === 503 || /timed out/i.test(err?.message ?? '');
      if (attempt < maxRetries && isRetryable) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Gemini request failed after retries');
}
