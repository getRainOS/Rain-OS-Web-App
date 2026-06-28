/**
 * Rate Limiter Tests
 * 
 * Tests for per-IP rate limiting middleware
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware, strictRateLimitMiddleware } from '../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(rateLimitMiddleware);
    app.get('/api/test', (_req: Request, res: Response) => {
      res.json({ success: true });
    });
  });

  it('should allow requests within limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/api/test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }
  });

  it('should set rate limit headers', async () => {
    const res = await request(app).get('/api/test');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
    expect(res.headers['ratelimit-reset']).toBeDefined();
  });

  it('should decrement remaining count', async () => {
    const res1 = await request(app).get('/api/test');
    const remaining1 = parseInt(res1.headers['ratelimit-remaining'] as string);

    const res2 = await request(app).get('/api/test');
    const remaining2 = parseInt(res2.headers['ratelimit-remaining'] as string);

    expect(remaining2).toBe(remaining1 - 1);
  });

  it('should return 429 when limit exceeded', async () => {
    // Make 101 requests (limit is 100)
    for (let i = 0; i < 101; i++) {
      const res = await request(app).get('/api/test');
      if (i < 100) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(429);
        expect(res.body.error).toBe('rate_limit_exceeded');
      }
    }
  });

  it('should include retry information in 429 response', async () => {
    // Exceed limit
    for (let i = 0; i < 101; i++) {
      await request(app).get('/api/test');
    }

    const res = await request(app).get('/api/test');
    expect(res.status).toBe(429);
    expect(res.body.retryAfter).toBeDefined();
    expect(typeof res.body.retryAfter).toBe('number');
  });

  it('should respect X-Forwarded-For header for proxy requests', async () => {
    const app2 = express();
    app2.use(express.json());
    app2.use(rateLimitMiddleware);
    app2.get('/api/test', (_req: Request, res: Response) => {
      res.json({ success: true });
    });

    // First request from IP 10.0.0.1
    const res1 = await request(app2)
      .get('/api/test')
      .set('X-Forwarded-For', '10.0.0.1');
    expect(res1.status).toBe(200);

    // Request from different IP 10.0.0.2 should have separate limit
    const res2 = await request(app2)
      .get('/api/test')
      .set('X-Forwarded-For', '10.0.0.2');
    expect(res2.status).toBe(200);
    expect(res2.headers['ratelimit-remaining']).toEqual(res1.headers['ratelimit-remaining']);
  });
});

describe('Strict Rate Limiter Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/auth/login', strictRateLimitMiddleware, (_req: Request, res: Response) => {
      res.json({ token: 'test' });
    });
  });

  it('should allow limited attempts', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/auth/login');
      expect(res.status).toBe(200);
    }
  });

  it('should return 429 after 5 attempts', async () => {
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/auth/login');
      if (i < 5) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(429);
        expect(res.body.error).toBe('rate_limit_exceeded');
      }
    }
  });

  it('should mention 1 hour window in error message', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app).post('/api/auth/login');
    }

    const res = await request(app).post('/api/auth/login');
    expect(res.body.message).toContain('hour');
  });
});
