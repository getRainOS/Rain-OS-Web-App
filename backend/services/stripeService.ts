// services/stripeService.ts
// This service handles all interactions with the Stripe API.
// It assumes the 'stripe' npm package is installed.
import Stripe from 'stripe';
import { findUserByStripeCustomerId, updateUserSubscription, resetUserUsage } from './dbService';
import type { User } from '../types';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Fix: The installed Stripe types appear to be for a preview version, causing a type mismatch.
  // Using the version string required by the type definition to resolve the error.
  apiVersion: '2024-06-20',
  typescript: true,
});

// Additive: fallback mapping if Stripe metadata isn't used.
const BUSINESS_PRICE_ID = process.env.STRIPE_PRICE_ID_BUSINESS;
const PRO_PRICE_ID = process.env.STRIPE_PRICE_ID_PRO;

const deriveUsageLimit = (price: Stripe.Price, priceId: string): number => {
  const meta = (price.metadata?.analysis_limit || '').trim();
  const parsed = meta ? parseInt(meta, 10) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;

  // fallback mapping by env (no Stripe metadata required)
  if (BUSINESS_PRICE_ID && priceId === BUSINESS_PRICE_ID) return 100;
  if (PRO_PRICE_ID && priceId === PRO_PRICE_ID) return 500;

  // default free tier
  return 5;
};

/**
 * Creates a Stripe Checkout session for a new subscription.
 */
export const createCheckoutSession = async (user: User, priceId: string): Promise<Stripe.Checkout.Session> => {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error('APP_URL not set');
  }

  let customerId = user.stripeCustomerId;

  // Verify if the customer exists in Stripe, create new if not
  if (customerId) {
    try {
      // Try to retrieve the customer to verify it exists
      await stripe.customers.retrieve(customerId);
    } catch (error: any) {
      // Customer doesn't exist in Stripe, clear the invalid ID
      console.log(`Customer ${customerId} not found in Stripe, creating new customer`);
      customerId = undefined;
    }
  }

  // Create a new Stripe customer if one doesn't exist or was invalid
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;
    await updateUserSubscription(user.id, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: customerId,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    success_url: `${appUrl}/dashboard?status=success`,
    cancel_url: `${appUrl}/dashboard?status=cancelled`,
    metadata: {
      userId: user.id,
    }
  });

  return session;
};

/**
 * Creates a Stripe Billing Portal session for a customer to manage their subscription.
 */
export const createPortalSession = async (user: User): Promise<Stripe.BillingPortal.Session> => {
    const appUrl = process.env.APP_URL;

    if (!appUrl) {
        throw new Error('APP_URL environment variable is not set.');
    }

    let customerId = user.stripeCustomerId;

    // Verify if the customer exists in Stripe
    if (customerId) {
        try {
            await stripe.customers.retrieve(customerId);
        } catch (error: any) {
            console.log(`Customer ${customerId} not found in Stripe for portal session`);
            customerId = undefined;
        }
    }

    if (!customerId) {
        // Create a new customer if they don't have one or it was invalid
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
                userId: user.id,
            },
        });
        customerId = customer.id;
        await updateUserSubscription(user.id, { stripeCustomerId: customerId });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/dashboard`, // User is returned here after managing their subscription
    });

    return portalSession;
};

/**
 * A centralized function to handle subscription state changes.
 */
const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
    const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const user = await findUserByStripeCustomerId(stripeCustomerId);
    console.log("user" , user)
    if (!user) {
        console.error(`Webhook Error: User not found for stripeCustomerId: ${stripeCustomerId}`);
        return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    console.log("pricdid",priceId )

    if (subscription.status === 'active' && priceId) {
        // Fetch the price object to get metadata
        const price = await stripe.prices.retrieve(priceId);
        const analysisLimit = deriveUsageLimit(price, priceId);

        await updateUserSubscription(user.id, {
            subscriptionStatus: 'active',
            stripePriceId: priceId,
            usageLimit: analysisLimit,
        });
        // Reset usage count on new/updated subscription to give user full limit
        await resetUserUsage(user.id);

    } else {
        // Subscription is cancelled, deleted, or otherwise inactive. Revert to free plan.
        await updateUserSubscription(user.id, {
            subscriptionStatus: subscription.status === 'canceled' ? 'cancelled' : 'active', // Keep them active on free plan
            stripePriceId: null, // No active paid price
            usageLimit: 5, // Revert to free tier limit
        });
        // Also reset usage when they cancel and move to the free tier
        await resetUserUsage(user.id);
    }
};

/**
 * Handles incoming Stripe webhook events to update user data.
 */
export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') {
        const subscriptionId = session.subscription;
        if (typeof subscriptionId !== 'string') {
            throw new Error('Webhook Error: Subscription ID not found in completed session.');
        }
        // Retrieve the full subscription object to handle it consistently
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("subscription", subscription);
        await handleSubscriptionChange(subscription);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("subscription", subscription);
      await handleSubscriptionChange(subscription);
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
};