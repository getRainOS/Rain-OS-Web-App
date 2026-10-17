import { describe, it, expect, vi } from 'vitest';
vi.mock('../services/db', () => ({ pool: { query: vi.fn() } }));
vi.mock('../services/dbService', () => ({ findUserByApiKey: vi.fn() }));
import { isAdminEmail } from '../api/admin';

describe('isAdminEmail', () => {
  it('defaults to the support address and ignores case', () => {
    expect(isAdminEmail('Support@GetRainOS.com', {} as any)).toBe(true);
    expect(isAdminEmail('someone@else.com', {} as any)).toBe(false);
    expect(isAdminEmail(undefined, {} as any)).toBe(false);
  });
  it('reads a comma-separated ADMIN_EMAILS list', () => {
    expect(isAdminEmail('b@x.com', { ADMIN_EMAILS: 'a@x.com, b@x.com' } as any)).toBe(true);
    expect(isAdminEmail('support@getrainos.com', { ADMIN_EMAILS: 'a@x.com' } as any)).toBe(false);
  });
});
