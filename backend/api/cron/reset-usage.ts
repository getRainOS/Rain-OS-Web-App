// api/cron/reset-usage.ts
// This file represents a secure, scheduled endpoint (cron job).

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { resetAllUsersUsage } from '../../services/dbService';
import type { ApiError } from '../../types';

const getAuthToken = (req: express.Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.split(' ')[1];
  return token || null;
}

export default async function handler(req: express.Request, res: express.Response) {
  // --- Authentication ---
  const token = getAuthToken(req);
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not set on the server.");
    return res.status(500).json({ error: 'internal_server_error', message: 'Cron secret is not configured.' } as ApiError);
  }

  if (token !== cronSecret) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or missing secret token.' } as ApiError);
  }
  // --- End Authentication ---

  try {
    const resetCount = await resetAllUsersUsage();
    return res.status(200).json({ message: `Usage reset successfully for ${resetCount} users.` });
  } catch (error) {
    console.error('Cron Job Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred during the cron job.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}