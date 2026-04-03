// api/users/me/regenerate-key.ts
// Securely regenerates the API key for the authenticated user.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByApiKey, regenerateUserApiKey } from '../../../services/dbService';
import type { User, ApiError } from '../../../types';

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

  try {
    const user: User | null = await findUserByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', message: 'The provided API key is invalid.' } as ApiError);
    }

    const updatedUserWithNewKey = await regenerateUserApiKey(user.id);

    if (!updatedUserWithNewKey) {
        throw new Error("Failed to regenerate the user's API key in the database.");
    }
    
    // This is another one of the few times the raw API key is sent to the client.
    // The client is responsible for updating its stored key.
    const clientSafeUser: Partial<User> & { apiKey: string } = {
      id: updatedUserWithNewKey.id,
      email: updatedUserWithNewKey.email,
      apiKey: updatedUserWithNewKey.apiKey,
      subscriptionStatus: updatedUserWithNewKey.subscriptionStatus,
      usage: updatedUserWithNewKey.usage,
      createdAt: updatedUserWithNewKey.createdAt,
    };

    return res.status(200).json(clientSafeUser);

  } catch (error) {
    console.error('API Key Regeneration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}