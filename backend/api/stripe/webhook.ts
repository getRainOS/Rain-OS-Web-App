// api/stripe/webhook.ts
// Handles incoming webhooks from Stripe to manage subscription status.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { stripe, handleWebhookEvent } from '../../services/stripeService';
import type { ApiError } from '../../types';

export default async function handler(req: express.Request, res: express.Response) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Stripe webhook error: Missing signature or secret.');
    return res.status(400).json({ error: 'bad_request', message: 'Webhook Error: Missing signature or secret.' } as ApiError);
  }

  let event;
  try {
    // IMPORTANT: stripe.webhooks.constructEvent requires the raw request body.
    // The Express server provides this via the `express.raw()` middleware for this route.
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Stripe webhook signature error: ${err.message}`);
    return res.status(400).json({ error: 'bad_request', message: `Webhook signature error: ${err.message}` } as ApiError);
  }

  // Handle the event
  try {
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    res.status(500).json({ error: 'internal_server_error', message: 'An error occurred while handling the webhook event.' } as ApiError);
  }
}