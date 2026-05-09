// api/stripe/create-checkout-session.ts
import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import { createCheckoutSession } from '../../services/stripeService';
import type { ApiError } from '../../types';

const getApiKey = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];
  return token || null;
};

export default async function handler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key is missing.' } as ApiError);
  }

  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key.' } as ApiError);
  }

  const { priceId, successUrl, cancelUrl } = req.body;

  if (!priceId || typeof priceId !== 'string') {
    return res.status(400).json({ error: 'bad_request', message: 'priceId is required.' } as ApiError);
  }

  try {
    const session = await createCheckoutSession(
      user,
      priceId,
      successUrl || undefined,
      cancelUrl || undefined,
    );
    if (!session.url) {
      throw new Error('Failed to create checkout session URL.');
    }
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error.';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}
