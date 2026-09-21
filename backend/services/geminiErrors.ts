// services/geminiErrors.ts — Classify unknown errors thrown by Gemini calls into
// safe, user-facing responses. Upstream error text and the API key must never
// reach the client, and the API key must never be logged either.

export interface GeminiErrorResult {
  status: 502 | 503;
  body: { error: 'ai_provider_busy' | 'ai_provider_error'; message: string };
}

const QUOTA_KEYWORDS = ['quota', 'resource_exhausted', 'too many requests', 'rate limit'];

// Matches a raw Google API key (AIza...) or a `?key=...`/`&key=...` query param,
// wherever it turns up in a stringified error — message, stack, or JSON body.
const API_KEY_PATTERN = /AIza[0-9A-Za-z_-]{35}/g;
const KEY_PARAM_PATTERN = /([?&]key=)[^&\s"'`]+/gi;

function redact(text: string): string {
  return text.replace(API_KEY_PATTERN, '[REDACTED]').replace(KEY_PARAM_PATTERN, '$1[REDACTED]');
}

function extractStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as Record<string, any>;
  const candidates = [e.status, e.statusCode, e.response?.status, e.code];
  for (const c of candidates) {
    if (typeof c === 'number') return c;
  }
  return undefined;
}

function extractMessage(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || '';
  if (typeof err === 'object') {
    const e = err as Record<string, any>;
    if (typeof e.message === 'string') return e.message;
    try { return JSON.stringify(e); } catch { return String(e); }
  }
  return String(err);
}

/** Best-effort extraction of quota metric/ID from the SDK's parsed error details
 *  or, failing that, from the raw message text (Gemini often embeds the quota
 *  failure as JSON inside the message string rather than a structured field). */
function extractQuotaDetails(err: unknown): { quotaMetric?: string; quotaId?: string } {
  const result: { quotaMetric?: string; quotaId?: string } = {};
  if (err && typeof err === 'object') {
    const e = err as Record<string, any>;
    const details = e.errorDetails || e.details || e.response?.data?.error?.details;
    if (Array.isArray(details)) {
      for (const d of details) {
        const violations = d?.violations;
        if (Array.isArray(violations)) {
          for (const v of violations) {
            if (v?.quotaMetric && !result.quotaMetric) result.quotaMetric = String(v.quotaMetric);
            if (v?.quotaId && !result.quotaId) result.quotaId = String(v.quotaId);
          }
        }
      }
    }
  }
  const msg = extractMessage(err);
  if (!result.quotaMetric) {
    const m = msg.match(/"quotaMetric"\s*:\s*"([^"]+)"/);
    if (m) result.quotaMetric = m[1];
  }
  if (!result.quotaId) {
    const m = msg.match(/"quotaId"\s*:\s*"([^"]+)"/);
    if (m) result.quotaId = m[1];
  }
  return result;
}

function isQuotaError(err: unknown): boolean {
  if (extractStatus(err) === 429) return true;
  const msg = extractMessage(err).toLowerCase();
  return QUOTA_KEYWORDS.some(k => msg.includes(k));
}

/**
 * Classify an unknown error thrown by a Gemini call, log the full original
 * error server-side (API key redacted), and return the safe status/body to
 * send to the client. Never include upstream error text or the API key in
 * the returned body.
 */
export function classifyGeminiError(err: unknown, tag: string): GeminiErrorResult {
  const status = extractStatus(err);
  const { quotaMetric, quotaId } = extractQuotaDetails(err);
  const quota = isQuotaError(err);

  const logParts = [`[gemini-error] ${tag}`, `status=${status ?? 'unknown'}`, `classified=${quota ? 'quota' : 'other'}`];
  if (quotaMetric) logParts.push(`quotaMetric=${quotaMetric}`);
  if (quotaId) logParts.push(`quotaId=${quotaId}`);

  const dump = err instanceof Error ? (err.stack || err.message) : extractMessage(err) || String(err);
  console.error(logParts.join(' '), redact(dump));

  if (quota) {
    return {
      status: 503,
      body: {
        error: 'ai_provider_busy',
        message: 'Our AI provider is temporarily at capacity. Please try again in a few minutes. This check was not counted against your usage.',
      },
    };
  }

  return {
    status: 502,
    body: {
      error: 'ai_provider_error',
      message: 'The AI provider returned an error. Please try again. This check was not counted against your usage.',
    },
  };
}
