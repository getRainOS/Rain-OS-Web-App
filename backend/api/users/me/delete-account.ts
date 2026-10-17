// api/users/me/delete-account.ts — POST /api/users/me/delete-account
// Deletes the signed-in account and everything saved under it. The user must
// type their email to confirm. Any subscription is cancelled first; if that
// fails nothing is deleted.
import express from 'express';
import { findUserByApiKey, deleteUserAccount } from '../../../services/dbService';
import { cancelAllSubscriptions } from '../../../services/stripeService';
import type { ApiError } from '../../../types';

export default async function handler(req: express.Request, res: express.Response) {
  const h = req.headers.authorization;
  const apiKey = (Array.isArray(h) ? h[0] : h)?.split(' ')[1];
  if (!apiKey) return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  const user = await findUserByApiKey(apiKey);
  if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);

  const confirm = typeof req.body?.confirm === 'string' ? req.body.confirm.trim().toLowerCase() : '';
  if (!confirm || confirm !== user.email.toLowerCase()) {
    return res.status(400).json({ error: 'bad_request', message: 'Type your account email exactly to confirm.' } as ApiError);
  }

  if (user.stripeCustomerId) {
    try {
      await cancelAllSubscriptions(user.stripeCustomerId);
    } catch (err) {
      console.error('Account deletion: cancelling subscription failed', err);
      return res.status(502).json({ error: 'billing_unavailable', message: "We couldn't cancel your subscription just now, so nothing was deleted. Please try again in a few minutes." } as ApiError);
    }
  }

  try {
    await deleteUserAccount(user.id);
  } catch (err) {
    console.error('Account deletion failed', err);
    return res.status(500).json({ error: 'server_error', message: 'Deleting your account failed. Nothing was removed. Please try again.' } as ApiError);
  }
  return res.status(200).json({ success: true });
}
