import { describe, it, expect } from 'vitest';
import { isAllowedOrigin, allowedOrigins } from '../services/corsOrigins';

describe('CORS origins', () => {
  it('allows the web app', () => {
    expect(isAllowedOrigin('https://getrainos.com')).toBe(true);
    expect(isAllowedOrigin('https://app.getrainos.com')).toBe(true);
  });

  it('allows local development', () => {
    expect(isAllowedOrigin('http://localhost:5000')).toBe(true);
  });

  it('refuses other browser origins', () => {
    expect(isAllowedOrigin('https://evil.example')).toBe(false);
    expect(isAllowedOrigin('https://getrainos.com.evil.example')).toBe(false);
    expect(isAllowedOrigin('http://getrainos.com')).toBe(false);
  });

  it('allows requests with no origin, which are not browser requests', () => {
    expect(isAllowedOrigin(undefined)).toBe(true);
  });

  it('adds origins listed in CORS_ALLOWED_ORIGINS', () => {
    const env = { CORS_ALLOWED_ORIGINS: 'https://preview.example, https://staging.example' } as NodeJS.ProcessEnv;
    expect(allowedOrigins(env)).toContain('https://staging.example');
    expect(isAllowedOrigin('https://preview.example', env)).toBe(true);
    expect(isAllowedOrigin('https://other.example', env)).toBe(false);
  });
});
