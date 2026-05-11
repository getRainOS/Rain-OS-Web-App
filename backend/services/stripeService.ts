// services/stripeService.ts
import Stripe from 'stripe';
import { findUserByStripeCustomerId, updateUserSubscription, resetUserUsage } from './dbService';
import type { User } from '../types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

const BUSINESS_PRICE_ID = process.env.STRIPE_PRICE_ID_BUSINESS;
const PRO_PRICE_ID = process.env.STRIPE_PRICE_ID_PRO;

const deriveUsageLimit = (price: Stripe.Price, priceId: string): number => {
  const meta = (price.metadata?.analysis_limit || '').trim();
  const parsed = meta ? parseInt(meta, 10) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  if (BUSINESS_PRICE_ID && priceId === BUSINESS_PRICE_ID) return 500;
  if (PRO_PRICE_ID && priceId === PRO_PRICE_ID) return 200;
  return 5;
};

/**
 * Creates a Stripe Checkout session for a new or changed subscription.
 * successUrl and cancelUrl override APP_URL-based defaults when provided.
 */
export const createCheckoutSession = async (
  user: User,
  priceId: string,
  successUrl?: string,
  cancelUrl?: string,
): Promise<Stripe.Checkout.Session> => {
  const appUrl = process.env.APP_URL || '';

  const finalSuccessUrl = successUrl || (appUrl ? `${appUrl}/#/dashboard` : undefined);
  const finalCancelUrl = cancelUrl || (appUrl ? `${appUrl}/#/upgrade` : undefined);

  if (!finalSuccessUrl || !finalCancelUrl) {
    throw new Error('Cannot determine redirect URLs — set APP_URL env var or pass explicit successUrl/cancelUrl.');
  }

  let customerId = user.stripeCustomerId;

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch {
      console.log(`Customer ${customerId} not found in Stripe — creating new customer`);
      customerId = undefined;
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await updateUserSubscription(user.id, { stripeCustomerId: customerId });
  }

  // If the user already has an active subscription, create a Checkout session
  // in subscription_update mode so they can switch plans cleanly.
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: finalSuccessUrl,
    cancel_url: finalCancelUrl,
    metadata: { userId: user.id },
  };

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
};

/**
 * Creates a Stripe Billing Portal session.
 * returnUrl overrides APP_URL-based default when provided.
 */
export const createPortalSession = async (
  user: User,
  returnUrl?: string,
): Promise<Stripe.BillingPortal.Session> => {
  const appUrl = process.env.APP_URL || '';
  const finalReturnUrl = returnUrl || (appUrl ? `${appUrl}/#/upgrade` : undefined);

  if (!finalReturnUrl) {
    throw new Error('Cannot determine return URL — set APP_URL env var or pass explicit returnUrl.');
  }

  let customerId = user.stripeCustomerId;

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch {
      console.log(`Customer ${customerId} not found in Stripe for portal session`);
      customerId = undefined;
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await updateUserSubscription(user.id, { stripeCustomerId: customerId });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: finalReturnUrl,
  });

  return portalSession;
};

/**
 * Centralised subscription state handler — called by webhook events.
 */
const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
  const stripeCustomerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const user = await findUserByStripeCustomerId(stripeCustomerId);
  if (!user) {
    console.error(`Webhook: user not found for stripeCustomerId ${stripeCustomerId}`);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;

  if (subscription.status === 'active' && priceId) {
    const price = await stripe.prices.retrieve(priceId);
    const analysisLimit = deriveUsageLimit(price, priceId);
    await updateUserSubscription(user.id, {
      subscriptionStatus: 'active',
      stripePriceId: priceId,
      usageLimit: analysisLimit,
    });
    await resetUserUsage(user.id);
  } else {
    await updateUserSubscription(user.id, {
      subscriptionStatus: subscription.status === 'canceled' ? 'cancelled' : 'active',
      stripePriceId: null,
      usageLimit: 5,
    });
    await resetUserUsage(user.id);
  }
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        const subscriptionId = session.subscription;
        if (typeof subscriptionId !== 'string') {
          throw new Error('Webhook: Subscription ID not found in completed session.');
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await handleSubscriptionChange(subscription);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
};
