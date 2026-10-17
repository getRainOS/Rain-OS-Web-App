// passwords.ts — salted, slow password hashing (scrypt).
//
// Stored format: scrypt$<N>$<r>$<p>$<salt hex>$<hash hex>. Older accounts
// hold a bare SHA-256 hex digest; verifyPassword still accepts those and
// reports needsUpgrade so login can re-save them in the new format.
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'crypto';

const N = 16384, R = 8, P = 1, KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('hex')}$${key.toString('hex')}`;
}

function sameHex(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex'), y = Buffer.from(b, 'hex');
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

export function verifyPassword(password: string, stored: string | null | undefined): { ok: boolean; needsUpgrade: boolean } {
  if (!stored) return { ok: false, needsUpgrade: false };
  if (stored.startsWith('scrypt$')) {
    const [, n, r, p, salt, key] = stored.split('$');
    const got = scryptSync(password, Buffer.from(salt, 'hex'), key.length / 2, { N: Number(n), r: Number(r), p: Number(p) });
    return { ok: sameHex(got.toString('hex'), key), needsUpgrade: false };
  }
  const legacy = createHash('sha256').update(password).digest('hex');
  const ok = sameHex(legacy, stored);
  return { ok, needsUpgrade: ok };
}
