// services/oauthStateStore.ts
// In-memory nonce store for OAuth state verification.
// Maps nonce → { userId, expiresAt } with 10-minute TTL.
// No DB required — state is ephemeral and only valid for one OAuth flow.

import { randomBytes } from 'crypto';

interface StateEntry {
  userId: string;
  expiresAt: number;
}

const store = new Map<string, StateEntry>();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function cleanUp() {
  const now = Date.now();
  for (const [nonce, entry] of store) {
    if (entry.expiresAt < now) store.delete(nonce);
  }
}

export function createOAuthState(userId: string): string {
  cleanUp();
  const nonce = randomBytes(24).toString('hex');
  store.set(nonce, { userId, expiresAt: Date.now() + TTL_MS });
  return nonce;
}

export function consumeOAuthState(nonce: string): string | null {
  cleanUp();
  const entry = store.get(nonce);
  if (!entry || entry.expiresAt < Date.now()) return null;
  store.delete(nonce);
  return entry.userId;
}
