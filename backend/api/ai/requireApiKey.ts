import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import type { ApiError } from '../../types';

// The AI readiness endpoints read and write data keyed by a client-chosen
// content id, so they need a valid API key like the rest of the app.
export async function requireApiKey(req: express.Request, res: express.Response): Promise<boolean> {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
  if (!apiKey || !(await findUserByApiKey(apiKey))) {
    res.status(401).json({ error: 'unauthorized', message: 'Valid API key required' } as ApiError);
    return false;
  }
  return true;
}
