// api/stripe/create-portal-session.ts
// Creates a Stripe Billing Portal session for a user to manage their subscription.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import { createPortalSession } from '../../services/stripeService';
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
  
  if (!user.stripeCustomerId) {
    return res.status(404).json({ error: 'not_found', message: 'No subscription found for this user. Cannot open management portal.' } as ApiError);
  }

  try {
    const session = await createPortalSession(user);
    if (!session.url) {
        throw new Error('Failed to create a portal session URL.');
    }
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Portal Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}