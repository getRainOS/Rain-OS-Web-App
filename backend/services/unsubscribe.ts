// services/unsubscribe.ts — signed one-click unsubscribe links for the weekly
// email and citation alerts. The token is an HMAC of the user id, so a link
// only ever works for the account it was sent to, and needs no sign-in.
import { createHmac, timingSafeEqual } from 'crypto';

// A dedicated secret when set (UNSUBSCRIBE_SECRET), so the email links don't
// depend on the encryption key. Falls back to ENCRYPTION_SECRET until it's set.
const secret = () => `unsubscribe:${process.env.UNSUBSCRIBE_SECRET || process.env.ENCRYPTION_SECRET || ''}`;
export const apiUrl = () => process.env.API_PUBLIC_URL || 'https://api.getrainos.com';

export function unsubscribeToken(userId: string): string {
  return createHmac('sha256', secret()).update(userId).digest('base64url').slice(0, 32);
}

export function verifyUnsubscribe(userId: unknown, token: unknown): boolean {
  if (typeof userId !== 'string' || typeof token !== 'string' || !userId || token.length !== 32) return false;
  const a = Buffer.from(unsubscribeToken(userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const unsubscribeUrl = (userId: string) =>
  `${apiUrl()}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;
