// services/scoredRewrites.ts — a rewrite's verified score, kept for an hour.
// When the user accepts the rewrite, the analysis reuses this score instead of
// scoring the same text again, so "After the rewrite: 92" is exactly what is
// saved. In memory: a restart just means the accept scores it again.
import { createHash } from 'crypto';
import type { AnalysisResponse } from '../types';

const TTL_MS = 60 * 60 * 1000;
const store = new Map<string, { result: AnalysisResponse; at: number }>();

const key = (userId: string, text: string, module: string) =>
  createHash('sha256').update(JSON.stringify([userId, text.trim(), module])).digest('hex');

export function rememberScoredRewrite(userId: string, text: string, module: string, result: AnalysisResponse) {
  const now = Date.now();
  for (const [k, v] of store) if (now - v.at > TTL_MS) store.delete(k);
  store.set(key(userId, text, module), { result, at: now });
}

export function takeScoredRewrite(userId: string, text: string, module: string): AnalysisResponse | null {
  const k = key(userId, text, module);
  const hit = store.get(k);
  if (!hit || Date.now() - hit.at > TTL_MS) return null;
  store.delete(k);
  return hit.result;
}
