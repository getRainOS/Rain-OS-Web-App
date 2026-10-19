// api/users/me/location.ts — POST /api/users/me/location { state }
// The user's US state (two-letter code), used to run ChatGPT checks as if
// asked from there. Send null or '' to clear it.
import express from 'express';
import { findUserByApiKey, updateUser } from '../../../services/dbService';
import { US_STATES } from '../../../services/engines/cloro';
import type { ApiError } from '../../../types';

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  const user = apiKey ? await findUserByApiKey(apiKey) : null;
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Sign in first.' } as ApiError);
  const raw = req.body?.state;
  const state = typeof raw === 'string' && raw.trim() ? raw.trim().toUpperCase() : null;
  if (state && !US_STATES.has(state)) return res.status(400).json({ error: 'bad_request', message: 'Pick a US state.' } as ApiError);
  await updateUser(user.id, { locationState: state });
  return res.status(200).json({ success: true, locationState: state });
}
