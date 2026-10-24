// services/planLimits.ts — what each plan unlocks. No database imports, so
// API handlers and tests can use it freely.
import type { User } from '../types';

// rain OS staff (ADMIN_EMAILS). They get a Business-level allowance so the
// team can test every tool without a paid subscription.
export function isAdminEmail(email: string | undefined, env: NodeJS.ProcessEnv = process.env): boolean {
  const list = (env.ADMIN_EMAILS || 'support@getrainos.com').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}
export const STAFF_USAGE_LIMIT = 100000;

// A two-letter US state saved with an analysis (where the business is), or null.
export const usState = (v: unknown): string | null =>
  typeof v === 'string' && /^[A-Za-z]{2}$/.test(v.trim()) ? v.trim().toUpperCase() : null;

export const PRO_TRACKING_CAP = 10;
export const BUSINESS_TRACKING_CAP = 30;

export function planTrackingCap(user: Pick<User, 'subscriptionStatus' | 'stripePriceId' | 'usage'>): number {
  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') return 0;
  const business = process.env.STRIPE_PRICE_ID_BUSINESS;
  const pro = process.env.STRIPE_PRICE_ID_PRO;
  if (business && user.stripePriceId === business) return BUSINESS_TRACKING_CAP;
  if (pro && user.stripePriceId === pro) return PRO_TRACKING_CAP;
  const limit = user.usage?.limit ?? 0;
  if (limit >= 500) return BUSINESS_TRACKING_CAP;
  if (limit >= 200) return PRO_TRACKING_CAP;
  return 0;
}

// Pro and Business. Checks on engines other than Gemini cost per run, so
// they're limited to these plans.
export const isPaidPlan = (user: Pick<User, 'subscriptionStatus' | 'stripePriceId' | 'usage'>): boolean =>
  planTrackingCap(user) > 0;
