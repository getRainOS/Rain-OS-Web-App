import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import type Stripe from 'stripe';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByStripeCustomerId = vi.fn();
const updateUserSubscription = vi.fn();
const resetUserUsage = vi.fn();
vi.mock('../services/dbService', () => ({
  findUserByStripeCustomerId: (...args: unknown[]) => findUserByStripeCustomerId(...args),
  updateUserSubscription: (...args: unknown[]) => updateUserSubscription(...args),
  resetUserUsage: (...args: unknown[]) => resetUserUsage(...args),
}));

// ─── Import the module under test after STRIPE_SECRET_KEY is set ────────────
// stripeService.ts throws at import time if the key is missing, so it must be
// dynamically imported inside beforeAll (matches the pattern used in
// analyze.api.test.ts for services that construct clients at module load).
let handleWebhookEvent: typeof import('../services/stripeService').handleWebhookEvent;
let createCheckoutSession: typeof import('../services/stripeService').createCheckoutSession;
let stripe: typeof import('../services/stripeService').stripe;

beforeAll(async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_unit_tests';
  const mod = await import('../services/stripeService');
  handleWebhookEvent = mod.handleWebhookEvent;
  createCheckoutSession = mod.createCheckoutSession;
  stripe = mod.stripe;
});

function makeUser(usage: { count: number; limit: number } = { count: 3, limit: 5 }) {
  return {
    id: 'user-1',
    email: 'u@example.com',
    stripeCustomerId: 'cus_123',
    subscriptionStatus: 'active',
    usage,
  } as any;
}

function makeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: 'sub_123',
    customer: 'cus_123',
    status: 'active',
    items: { data: [{ price: { id: 'price_x' } }] },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

function mockPriceLimit(limit: number) {
  return vi.spyOn(stripe.prices, 'retrieve').mockResolvedValue({
    id: 'price_x',
    metadata: { analysis_limit: String(limit) },
  } as any);
}

describe('handleWebhookEvent — subscription changes (upgrade/downgrade/cancel)', () => {
  beforeEach(() => {
    findUserByStripeCustomerId.mockReset();
    updateUserSubscription.mockReset();
    resetUserUsage.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('upgrade: resets usage when the new limit is higher than the current limit', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser({ count: 4, limit: 5 }));
    mockPriceLimit(200);

    await handleWebhookEvent({
      type: 'customer.subscription.updated',
      data: { object: makeSubscription({ status: 'active' }) },
    } as unknown as Stripe.Event);

    expect(updateUserSubscription).toHaveBeenCalledWith('user-1', expect.objectContaining({ usageLimit: 200, subscriptionStatus: 'active' }));
    expect(resetUserUsage).toHaveBeenCalledTimes(1);
    expect(resetUserUsage).toHaveBeenCalledWith('user-1', 'upgrade');
  });

  it('downgrade: updates the limit but never resets the count', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser({ count: 150, limit: 500 }));
    mockPriceLimit(200);

    await handleWebhookEvent({
      type: 'customer.subscription.updated',
      data: { object: makeSubscription({ status: 'active' }) },
    } as unknown as Stripe.Event);

    expect(updateUserSubscription).toHaveBeenCalledWith('user-1', expect.objectContaining({ usageLimit: 200 }));
    expect(resetUserUsage).not.toHaveBeenCalled();
  });

  it('lateral move (equal limit): updates but does not reset', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser({ count: 10, limit: 200 }));
    mockPriceLimit(200);

    await handleWebhookEvent({
      type: 'customer.subscription.updated',
      data: { object: makeSubscription({ status: 'active' }) },
    } as unknown as Stripe.Event);

    expect(resetUserUsage).not.toHaveBeenCalled();
  });

  it('cancellation: falls back to the Free limit and never resets the count', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser({ count: 37, limit: 200 }));

    await handleWebhookEvent({
      type: 'customer.subscription.deleted',
      data: { object: makeSubscription({ status: 'canceled', items: { data: [] } as any }) },
    } as unknown as Stripe.Event);

    expect(updateUserSubscription).toHaveBeenCalledWith('user-1', {
      subscriptionStatus: 'cancelled',
      stripePriceId: null,
      usageLimit: 5,
    });
    expect(resetUserUsage).not.toHaveBeenCalled();
  });

  it('no matching user: does nothing (no throw, no updates)', async () => {
    findUserByStripeCustomerId.mockResolvedValue(null);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await handleWebhookEvent({
      type: 'customer.subscription.updated',
      data: { object: makeSubscription({ status: 'active' }) },
    } as unknown as Stripe.Event);

    expect(updateUserSubscription).not.toHaveBeenCalled();
    expect(resetUserUsage).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

describe('handleWebhookEvent — invoice.paid renewal', () => {
  beforeEach(() => {
    findUserByStripeCustomerId.mockReset();
    resetUserUsage.mockReset();
  });

  it('resets usage on a subscription_cycle renewal invoice', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser());

    await handleWebhookEvent({
      type: 'invoice.paid',
      data: { object: { customer: 'cus_123', billing_reason: 'subscription_cycle' } },
    } as unknown as Stripe.Event);

    expect(findUserByStripeCustomerId).toHaveBeenCalledWith('cus_123');
    expect(resetUserUsage).toHaveBeenCalledTimes(1);
    expect(resetUserUsage).toHaveBeenCalledWith('user-1', 'renewal');
  });

  it('does not reset usage on a non-cycle invoice (e.g. a subscription_update proration)', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser());

    await handleWebhookEvent({
      type: 'invoice.paid',
      data: { object: { customer: 'cus_123', billing_reason: 'subscription_update' } },
    } as unknown as Stripe.Event);

    expect(resetUserUsage).not.toHaveBeenCalled();
    // Billing-reason check happens before the user lookup.
    expect(findUserByStripeCustomerId).not.toHaveBeenCalled();
  });

  it('does not reset usage on a subscription_create invoice (initial signup, handled by checkout.session.completed instead)', async () => {
    findUserByStripeCustomerId.mockResolvedValue(makeUser());

    await handleWebhookEvent({
      type: 'invoice.paid',
      data: { object: { customer: 'cus_123', billing_reason: 'subscription_create' } },
    } as unknown as Stripe.Event);

    expect(resetUserUsage).not.toHaveBeenCalled();
  });
});

describe('createCheckoutSession — plan changes must not create a second subscription', () => {
  beforeEach(() => {
    findUserByStripeCustomerId.mockReset();
    updateUserSubscription.mockReset();
    resetUserUsage.mockReset();
    vi.spyOn(stripe.customers, 'retrieve').mockResolvedValue({ id: 'cus_123', deleted: false } as any);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('existing subscriber changing plans: updates the existing subscription in place, does not create a new Checkout session or subscription', async () => {
    const listSpy = vi.spyOn(stripe.subscriptions, 'list').mockResolvedValue({
      data: [
        makeSubscription({
          id: 'sub_existing',
          status: 'active',
          items: { data: [{ id: 'si_existing', price: { id: 'price_pro' } }] } as any,
        }),
      ],
    } as any);
    const updateSpy = vi.spyOn(stripe.subscriptions, 'update').mockResolvedValue({ id: 'sub_existing' } as any);
    const checkoutCreateSpy = vi.spyOn(stripe.checkout.sessions, 'create');

    const user = makeUser();
    const result = await createCheckoutSession(user, 'price_business');

    expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({ customer: 'cus_123', status: 'active' }));
    expect(updateSpy).toHaveBeenCalledWith('sub_existing', {
      items: [{ id: 'si_existing', price: 'price_business' }],
      proration_behavior: 'create_prorations',
    });
    // The regression this fixes: no second subscription must ever be created.
    expect(checkoutCreateSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: 'updated', subscriptionId: 'sub_existing', priceId: 'price_business' });

    // The limit/reset side effects belong to the customer.subscription.updated
    // webhook handler (already covered above), not to this code path.
    expect(updateUserSubscription).not.toHaveBeenCalled();
    expect(resetUserUsage).not.toHaveBeenCalled();
  });

  it('Free user (no active subscription): still gets a normal new Checkout session', async () => {
    vi.spyOn(stripe.subscriptions, 'list').mockResolvedValue({ data: [] } as any);
    const checkoutCreateSpy = vi.spyOn(stripe.checkout.sessions, 'create').mockResolvedValue({
      url: 'https://checkout.stripe.com/session_abc',
    } as any);
    const updateSpy = vi.spyOn(stripe.subscriptions, 'update');

    const user = makeUser();
    const result = await createCheckoutSession(
      user,
      'price_pro',
      'https://app.test/success',
      'https://app.test/cancel',
    );

    expect(checkoutCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        customer: 'cus_123',
        line_items: [{ price: 'price_pro', quantity: 1 }],
        success_url: 'https://app.test/success',
        cancel_url: 'https://app.test/cancel',
      })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ kind: 'checkout', url: 'https://checkout.stripe.com/session_abc' });
  });

  it('clicking the plan you are already on: rejected cleanly, no Stripe subscription mutation', async () => {
    vi.spyOn(stripe.subscriptions, 'list').mockResolvedValue({
      data: [
        makeSubscription({
          id: 'sub_existing',
          status: 'active',
          items: { data: [{ id: 'si_existing', price: { id: 'price_pro' } }] } as any,
        }),
      ],
    } as any);
    const updateSpy = vi.spyOn(stripe.subscriptions, 'update');
    const checkoutCreateSpy = vi.spyOn(stripe.checkout.sessions, 'create');

    const user = makeUser();
    const result = await createCheckoutSession(user, 'price_pro');

    expect(result).toEqual({ kind: 'unchanged' });
    expect(updateSpy).not.toHaveBeenCalled();
    expect(checkoutCreateSpy).not.toHaveBeenCalled();
    expect(updateUserSubscription).not.toHaveBeenCalled();
    expect(resetUserUsage).not.toHaveBeenCalled();
  });
});
