import { describe, it, expect } from 'vitest';
import { unsubscribeToken, verifyUnsubscribe, unsubscribeUrl } from '../services/unsubscribe';

describe('unsubscribe links', () => {
  it('verify only for the account they were made for', () => {
    const t = unsubscribeToken('user-1');
    expect(verifyUnsubscribe('user-1', t)).toBe(true);
    expect(verifyUnsubscribe('user-2', t)).toBe(false);
    expect(verifyUnsubscribe('user-1', 'x'.repeat(32))).toBe(false);
    expect(verifyUnsubscribe('user-1', undefined)).toBe(false);
  });

  it('builds a link carrying the user and token', () => {
    expect(unsubscribeUrl('user-1')).toContain(`/api/email/unsubscribe?u=user-1&t=${unsubscribeToken('user-1')}`);
  });
});
