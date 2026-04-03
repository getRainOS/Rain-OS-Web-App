// api/stripe/create-checkout-session.ts
// Creates a Stripe Checkout session for a user to subscribe.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import { createCheckoutSession } from '../../services/stripeService';
import type { User, ApiError } from '../../types';

const getApiKey = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];
  return token || null;
}

export default async function handler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key is missing from the Authorization header.' } as ApiError);
  }

  const user: User | null = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'The provided API key is invalid.' } as ApiError);
  }

  if (user.subscriptionStatus === 'active' && user.usage.limit > 5) {
    return res.status(409).json({ error: 'conflict', message: 'This user already has an active subscription.' } as ApiError);
  }

  try {
    const { priceId } = req.body;

    if (!priceId || typeof priceId !== 'string') {
        return res.status(400).json({ error: 'bad_request', message: 'Missing required parameter: "priceId" must be provided.' } as ApiError);
    }

    const session = await createCheckoutSession(user, priceId);
    if (!session.url) {
        throw new Error('Failed to create a checkout session URL.');
    }
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}