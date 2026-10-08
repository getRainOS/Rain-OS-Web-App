// api/users/me/update-name.ts
// Lets the authenticated user set or change their display name — the name
// shown in the dashboard greeting. Google sign-ins get this pre-filled from
// their OAuth profile (see auth/sync.ts); this endpoint covers everyone
// else, and lets anyone override it.

import express from 'express';
import { findUserByApiKey, updateUser } from '../../../services/dbService';
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

  const { name } = req.body as { name?: string };
  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'bad_request', message: 'name is required and must be a string.' } as ApiError);
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'bad_request', message: 'name cannot be empty.' } as ApiError);
  }
  if (trimmed.length > 100) {
    return res.status(400).json({ error: 'bad_request', message: 'name is too long (max 100 characters).' } as ApiError);
  }

  try {
    const user: User | null = await findUserByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', message: 'The provided API key is invalid.' } as ApiError);
    }

    const updated = await updateUser(user.id, { name: trimmed });
    if (!updated) {
      throw new Error("Failed to update the user's name in the database.");
    }

    return res.status(200).json({ id: updated.id, name: updated.name });

  } catch (error) {
    console.error('Update Name Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}
