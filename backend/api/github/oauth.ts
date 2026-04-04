// api/github/oauth.ts
// Initiates GitHub OAuth flow — the user's Rain OS API key is passed as state
// so we can link the GitHub account to the correct user in the callback.

import express from 'express';
import { findUserByApiKey } from '../../services/dbService';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const apiKey = req.query.api_key as string;
    if (!apiKey) {
      return res.status(400).json({ error: 'bad_request', message: 'api_key query param is required' });
    }

    const user = await findUserByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'configuration_error', message: 'GitHub OAuth is not configured' });
    }

    // Encode the API key as state so we can retrieve the user in the callback
    const state = Buffer.from(apiKey).toString('base64url');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `https://api.getrainos.com/api/github/oauth/callback`,
      scope: 'repo read:user',
      state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  } catch (error) {
    console.error('GitHub OAuth redirect error:', error);
    res.status(500).json({ error: 'internal_server_error', message: 'Failed to initiate GitHub OAuth' });
  }
}
