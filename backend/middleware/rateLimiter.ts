/**
 * Rate Limiter Middleware
 * 
 * Per-IP rate limiting to prevent API abuse and DDoS attacks.
 * Uses in-memory store with sliding window algorithm.
 * 
 * Configuration:
 * - windowMs: 15 minutes
 * - maxRequests: 100 requests per IP per window
 * 
 * SECURITY: Tracks by IP address; respects X-Forwarded-For header for proxied requests.
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // requests per window
const CLEANUP_INTERVAL = 60 * 1000; // clean up every minute

// Cleanup old entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const ip in store) {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Get client IP from request, respecting proxy headers
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = getClientIp(req);
  const now = Date.now();

  // Initialize or update entry
  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    next();
    return;
  }

  // Reset if window has expired
  if (store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    next();
    return;
  }

  // Increment counter
  store[ip].count++;

  // Set headers for client
  const remaining = Math.max(0, MAX_REQUESTS - store[ip].count);
  const resetTime = store[ip].resetTime;

  res.set('RateLimit-Limit', MAX_REQUESTS.toString());
  res.set('RateLimit-Remaining', remaining.toString());
  res.set('RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

  // Check if limit exceeded
  if (store[ip].count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: `Too many requests. Maximum ${MAX_REQUESTS} requests per 15 minutes allowed.`,
      retryAfter: Math.ceil((resetTime - now) / 1000),
    });
    return;
  }

  next();
}

/**
 * Strict rate limiter for sensitive endpoints (auth, password reset)
 * - windowMs: 1 hour
 * - maxRequests: 5 attempts
 */
const strictStore: RateLimitStore = {};

setInterval(() => {
  const now = Date.now();
  for (const ip in strictStore) {
    if (strictStore[ip].resetTime < now) {
      delete strictStore[ip];
    }
  }
}, CLEANUP_INTERVAL);

export function strictRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = getClientIp(req);
  const now = Date.now();
  const STRICT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const STRICT_MAX_REQUESTS = 5; // attempts

  if (!strictStore[ip]) {
    strictStore[ip] = {
      count: 1,
      resetTime: now + STRICT_WINDOW_MS,
    };
    next();
    return;
  }

  if (strictStore[ip].resetTime < now) {
    strictStore[ip] = {
      count: 1,
      resetTime: now + STRICT_WINDOW_MS,
    };
    next();
    return;
  }

  strictStore[ip].count++;

  const remaining = Math.max(0, STRICT_MAX_REQUESTS - strictStore[ip].count);
  const resetTime = strictStore[ip].resetTime;

  res.set('RateLimit-Limit', STRICT_MAX_REQUESTS.toString());
  res.set('RateLimit-Remaining', remaining.toString());
  res.set('RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

  if (strictStore[ip].count > STRICT_MAX_REQUESTS) {
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: `Too many attempts. Maximum ${STRICT_MAX_REQUESTS} attempts per hour allowed.`,
      retryAfter: Math.ceil((resetTime - now) / 1000),
    });
    return;
  }

  next();
}
