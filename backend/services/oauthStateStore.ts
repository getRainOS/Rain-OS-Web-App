// services/oauthStateStore.ts
// DB-backed OAuth nonce store — deployment-safe across multiple instances.
// Uses the `oauth_states` table (created by dbSetup.ts) with a 10-minute TTL.
// Nonces are consumed on first use (one-time semantics) to prevent replay.

import { randomBytes } from 'crypto';
import { pool } from './db';

const TTL_MINUTES = 10;

export async function createOAuthState(userId: string, returnTo: string | null = null): Promise<string> {
  const nonce = randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO oauth_states (nonce, user_id, expires_at, return_to)
     VALUES ($1, $2, NOW() + INTERVAL '${TTL_MINUTES} minutes', $3)`,
    [nonce, userId, returnTo]
  );
  // Best-effort cleanup of expired rows — does not block the OAuth flow
  pool.query(`DELETE FROM oauth_states WHERE expires_at < NOW()`).catch(() => undefined);
  return nonce;
}

export interface ConsumedOAuthState {
  userId: string;
  returnTo: string | null;
}

export async function consumeOAuthState(nonce: string): Promise<ConsumedOAuthState | null> {
  const result = await pool.query<{ user_id: string; return_to: string | null }>(
    `DELETE FROM oauth_states
     WHERE nonce = $1 AND expires_at > NOW()
     RETURNING user_id, return_to`,
    [nonce]
  );
  const row = result.rows[0];
  return row ? { userId: row.user_id, returnTo: row.return_to } : null;
}
