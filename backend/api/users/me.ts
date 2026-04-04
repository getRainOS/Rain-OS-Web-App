// api/users/me.ts
// Retrieves the currently authenticated user's details.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import type { User, ApiError } from '../../types';

const getApiKey = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];
  return token || null;
}

export default async function handler(req: express.Request, res: express.Response) {

  console.log('Received request for /api/users/me');
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key is missing from the Authorization header.' } as ApiError);
  }

  try {
    const user: User | null = await findUserByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', message: 'The provided API key is invalid.' } as ApiError);
    }

    // Return a client-safe version of the user object
    const clientSafeUser: Partial<User> = {
      id: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      stripePriceId: user.stripePriceId,
      usage: user.usage,
      createdAt: user.createdAt,
      apiKey: user?.apiKey,
      githubId: user.githubId,
      githubLogin: user.githubLogin,
    };

    console.log('Fetched user:', clientSafeUser);

    return res.status(200).json(clientSafeUser);

  } catch (error) {
    console.error('Error fetching user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}