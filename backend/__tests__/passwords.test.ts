import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';
import { hashPassword, verifyPassword } from '../services/passwords';

describe('passwords', () => {
  it('hashes with a random salt and verifies', () => {
    const a = hashPassword('correct horse');
    expect(a.startsWith('scrypt$')).toBe(true);
    expect(a).not.toBe(hashPassword('correct horse'));
    expect(verifyPassword('correct horse', a)).toEqual({ ok: true, needsUpgrade: false });
    expect(verifyPassword('wrong', a).ok).toBe(false);
  });
  it('accepts an old SHA-256 hash and asks for an upgrade', () => {
    const old = createHash('sha256').update('pw123456').digest('hex');
    expect(verifyPassword('pw123456', old)).toEqual({ ok: true, needsUpgrade: true });
    expect(verifyPassword('nope', old)).toEqual({ ok: false, needsUpgrade: false });
    expect(verifyPassword('x', null).ok).toBe(false);
  });
});
