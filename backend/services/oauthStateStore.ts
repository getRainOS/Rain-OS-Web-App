// services/oauthStateStore.ts
// DB-backed OAuth nonce store — deployment-safe across multiple instances.
// Uses the `oauth_states` table (created by dbSetup.ts) with a 10-minute TTL.
// Nonces are consumed on first use (one-time semantics) to prevent replay.

import { randomBytes } from 'crypto';
import { pool } from './db';

const TTL_MINUTES = 10;

export async function createOAuthState(userId: string): Promise<string> {
  const nonce = randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO oauth_states (nonce, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${TTL_MINUTES} minutes')`,
    [nonce, userId]
  );
  // Best-effort cleanup of expired rows — does not block the OAuth flow
  pool.query(`DELETE FROM oauth_states WHERE expires_at < NOW()`).catch(() => undefined);
  return nonce;
}

export async function consumeOAuthState(nonce: string): Promise<string | null> {
  const result = await pool.query<{ user_id: string }>(
    `DELETE FROM oauth_states
     WHERE nonce = $1 AND expires_at > NOW()
     RETURNING user_id`,
    [nonce]
  );
  return result.rows[0]?.user_id ?? null;
}
