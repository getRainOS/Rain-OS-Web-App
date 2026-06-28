# Security Implementation Guide

## Overview

This document outlines the security practices and mitigations implemented in the Rain OS backend API.

---

## 1. Secrets Management

### ✅ NEVER expose API keys in frontend bundle

**Policy**: All sensitive keys (API_KEY, GEMINI_API_KEY, STRIPE_SECRET_KEY) are strictly backend-only.

**Implementation**:
- Removed `process.env.GEMINI_API_KEY` from `vite.config.ts`
- Frontend has NO access to backend secrets
- All AI analysis requests route through authenticated backend endpoints
- Only the backend calls Google Gemini API directly

**Environment Variables** (Backend Only):
```
API_KEY=your_google_gemini_api_key
GEMINI_API_KEY=your_google_gemini_api_key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
ENCRYPTION_SECRET=32_char_random_string
CRON_SECRET=secure_random_string
```

**Frontend Environment Variables** (Safe to expose):
```
VITE_API_BASE_URL=https://api.getrainos.com
```

---

## 2. Rate Limiting

### Per-IP Rate Limiting

Protects against:
- Brute-force attacks
- API abuse
- DDoS attacks

**Configuration** (`backend/middleware/rateLimiter.ts`):

#### Standard Rate Limit (All endpoints)
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Response Header**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

#### Strict Rate Limit (Auth endpoints)
- **Window**: 1 hour
- **Limit**: 5 attempts per IP
- **Applied to**:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/auth/google`
  - `POST /api/auth/password-reset/request`
  - `POST /api/auth/password-reset/submit`

**Client-side handling**:
```javascript
if (response.status === 429) {
  const retryAfter = response.headers['retry-after'];
  console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
}
```

**IP Detection**:
- Respects `X-Forwarded-For` header for proxied requests
- Falls back to socket remote address
- Configurable via `getClientIp()` function

---

## 3. Authentication & Authorization

### API Key Authentication
- All requests to protected endpoints require `Authorization: Bearer <api_key>` header
- API keys are hashed in database
- Users can regenerate keys via `/api/users/me/regenerate-key`

### OAuth
- Google OAuth for user signup/login
- GitHub OAuth for repo analysis
- All tokens validated server-side

---

## 4. Input Validation

**Applied to**:
- Content analysis: minimum 10 characters
- URL scanning: must be valid URL format
- Citation checks: 3-500 character topic requirement
- File uploads: size limits enforced

**Example** (`backend/api/citation-check.ts`):
```typescript
if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
  return res.status(400).json({
    error: 'bad_request',
    message: 'topic is required (min 3 characters)',
  } as ApiError);
}
if (topic.length > 500) {
  return res.status(400).json({
    error: 'bad_request',
    message: 'topic is too long (max 500 characters)',
  } as ApiError);
}
```

---

## 5. CORS Configuration

**Current Policy**: Wildcard origin `*` to support WordPress plugin on any site.

**Security Notes**:
- No credentials are sent with requests (`credentials: omit`)
- Sensitive operations use API key auth, not cookies
- If migrating to credential-based auth, implement scoped CORS per domain

---

## 6. Error Handling

### Error Messages
- Generic error messages in production (don't leak system details)
- Detailed error logging on server (for debugging)
- Example: Return "Invalid API key" instead of "User not found in database"

### Example** (`backend/api/users/me.ts`):
```typescript
catch (error) {
  console.error('Error fetching user:', error);
  const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
  return res.status(500).json({ 
    error: 'internal_server_error', 
    message: errorMessage 
  } as ApiError);
}
```

---

## 7. Database Security

### Encryption
- GitHub OAuth tokens encrypted with AES-256-CBC
- `ENCRYPTION_SECRET` must be 32 characters (256 bits)

### Password Hashing
- User passwords hashed with bcrypt
- Never stored in plaintext

### Access Control
- User can only access their own data
- Subscription status verified before API access
- Usage limits enforced per user

---

## 8. Webhook Validation

### Stripe Webhooks
- All webhooks verified with `stripe.webhooks.constructEvent()`
- Signature validation prevents spoofed events
- Webhook secret stored securely in environment

---

## 9. Deployment Checklist

Before going to production:

- [ ] All API keys are in `.env` (never in `.git`)
- [ ] `ENCRYPTION_SECRET` is 32 random characters
- [ ] `CRON_SECRET` is set to a secure random string
- [ ] HTTPS enabled on all endpoints
- [ ] Database backups configured
- [ ] Rate limit values tuned for expected traffic
- [ ] Error logging system configured (e.g., Sentry)
- [ ] CORS origins reviewed and finalized
- [ ] Rate limit response headers tested
- [ ] Secrets rotated regularly
- [ ] Security.txt file deployed (for vulnerability reporting)

---

## 10. Common Vulnerabilities Mitigated

| Vulnerability | Mitigation | Status |
|---|---|---|
| **Exposed API Keys** | Removed from frontend bundle; backend-only | ✅ |
| **Brute-force Attacks** | Strict rate limiting on auth endpoints | ✅ |
| **API Abuse** | Per-IP rate limiting (100 req/15min) | ✅ |
| **SQL Injection** | Parameterized queries via `pg` library | ✅ |
| **XSS** | Input validation; output escaping | ⚠️ In progress |
| **CSRF** | API key auth instead of cookies | ✅ |
| **Unauthorized Access** | API key verification on all protected routes | ✅ |
| **Information Disclosure** | Generic error messages; detailed logs server-side | ✅ |

---

## 11. Monitoring & Logging

**Recommended Tools**:
- Error tracking: Sentry, Rollbar
- Log aggregation: ELK Stack, LogRocket
- Uptime monitoring: Pingdom, StatusPage

**Key Metrics to Track**:
- Rate limit violations (detect abuse patterns)
- Failed auth attempts (brute-force detection)
- API error rates (service health)
- Database query performance (slow query log)

---

## 12. Contact & Reporting

For security vulnerabilities, please follow responsible disclosure:

1. Email: security@getrainos.com
2. Do not disclose publicly until patched
3. Allow 30 days for patch development

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
