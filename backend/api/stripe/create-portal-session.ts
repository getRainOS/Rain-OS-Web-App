// api/stripe/create-portal-session.ts
import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import { createPortalSession } from '../../services/stripeService';
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

  const { returnUrl } = req.body;

  try {
    const session = await createPortalSession(user, returnUrl || undefined);
    if (!session.url) {
      throw new Error('Failed to create portal session URL.');
    }
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Portal Error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error.';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}
