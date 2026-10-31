// services/costlyLimiter.ts — a per-user limit for routes that spend paid AI or
// data-provider calls. The general limit is per IP; this one is per API key,
// so one account cannot run up provider costs in a burst even within its plan.
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const costlyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => {
    const auth = req.headers.authorization;
    return auth ? `key:${auth}` : `ip:${ipKeyGenerator(req.ip ?? '')}`;
  },
  message: { error: 'Too many checks in a short time. Please wait a minute and try again.' },
});
