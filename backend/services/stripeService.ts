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
 * Result of createCheckoutSession — one of three outcomes depending on
 * whether the user already has an active Stripe subscription:
 *   - 'checkout':  no active subscription — a new Checkout session was
 *                  created; the caller should redirect the browser to `url`.
 *   - 'updated':   an active subscription exists and the requested price
 *                  differs from the current one — it was updated in place
 *                  via stripe.subscriptions.update(), no new subscription
 *                  or Checkout session was created, and no payment-method
 *                  entry is needed. The DB (usage limit, count reset) is
 *                  NOT touched here — that's the job of the existing
 *                  customer.subscription.updated webhook handler
 *                  (handleSubscriptionChange, above), which Stripe fires
 *                  for a subscriptions.update() call the same as for any
 *                  other subscription change.
 *   - 'unchanged': the requested price is the same as the user's current
 *                  plan — nothing was done.
 */
export type ChangePlanResult =
  | { kind: 'checkout'; url: string }
  | { kind: 'updated'; subscriptionId: string; priceId: string }
  | { kind: 'unchanged' };

/**
 * Starts or changes a subscription for the given price.
 * successUrl and cancelUrl override APP_URL-based defaults when provided
 * (only used for the 'checkout' outcome, i.e. when there's no active
 * subscription yet to update in place).
 */
export const createCheckoutSession = async (
  user: User,
  priceId: string,
  successUrl?: string,
  cancelUrl?: string,
): Promise<ChangePlanResult> => {
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

  // We don't persist the active subscription ID on the user record, so look
  // it up from Stripe each time. This is one extra read call on an
  // infrequent, non-hot-path endpoint — cheap, but if this becomes a
  // bottleneck, storing stripeSubscriptionId (set from the webhook, same as
  // stripePriceId) would let us skip this lookup.
  const activeSubs = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });
  const existingSubscription = activeSubs.data[0];

  if (existingSubscription) {
    const currentItem = existingSubscription.items.data[0];
    const currentPriceId = currentItem?.price.id;

    if (currentPriceId === priceId) {
      return { kind: 'unchanged' };
    }

    await stripe.subscriptions.update(existingSubscription.id, {
      items: [{ id: currentItem.id, price: priceId }],
      proration_behavior: 'create_prorations',
    });

    return { kind: 'updated', subscriptionId: existingSubscription.id, priceId };
  }

  // No active subscription — new subscriber (or resubscribing after
  // cancellation). Behaviour unchanged from before this fix: create a
  // Checkout session so they can enter payment details.
  const appUrl = process.env.APP_URL || '';
  const finalSuccessUrl = successUrl || (appUrl ? `${appUrl}/#/dashboard` : undefined);
  const finalCancelUrl = cancelUrl || (appUrl ? `${appUrl}/#/upgrade` : undefined);

  if (!finalSuccessUrl || !finalCancelUrl) {
    throw new Error('Cannot determine redirect URLs — set APP_URL env var or pass explicit successUrl/cancelUrl.');
  }

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
  if (!session.url) {
    throw new Error('Failed to create checkout session URL.');
  }
  return { kind: 'checkout', url: session.url };
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
 *
 * Reset rule: usage count is reset to 0 only on an upgrade (new plan's
 * analysis_limit is strictly higher than the user's current limit). A
 * downgrade, cancellation, or any other status change updates the limit
 * (and status/priceId) but never touches the count — renewal resets are
 * handled separately, by invoice.paid (see handleInvoicePaid below).
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
    const newLimit = deriveUsageLimit(price, priceId);
    const isUpgrade = newLimit > user.usage.limit;

    await updateUserSubscription(user.id, {
      subscriptionStatus: 'active',
      stripePriceId: priceId,
      usageLimit: newLimit,
    });

    if (isUpgrade) {
      await resetUserUsage(user.id, 'upgrade');
    }
  } else {
    // Downgrade to no active subscription (cancellation, incomplete, etc.):
    // the limit falls back to Free, but the count is left untouched.
    await updateUserSubscription(user.id, {
      subscriptionStatus: subscription.status === 'canceled' ? 'cancelled' : 'active',
      stripePriceId: null,
      usageLimit: 5,
    });
  }
};

/**
 * Renewal handler — called on invoice.paid. Only a subscription_cycle
 * invoice (a normal recurring renewal, not a proration or plan-change
 * invoice) resets the usage count.
 */
const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  if (invoice.billing_reason !== 'subscription_cycle') return;

  const stripeCustomerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id;
  if (!stripeCustomerId) {
    console.error('Webhook: invoice.paid event missing a customer ID');
    return;
  }

  const user = await findUserByStripeCustomerId(stripeCustomerId);
  if (!user) {
    console.error(`Webhook: user not found for stripeCustomerId ${stripeCustomerId} (invoice.paid)`);
    return;
  }

  await resetUserUsage(user.id, 'renewal');
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
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
};
