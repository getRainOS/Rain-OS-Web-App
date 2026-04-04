// api/github/oauth.ts
// POST /api/github/oauth/init — creates a secure nonce-based OAuth state,
// returns the GitHub OAuth URL for the frontend to redirect to.
// Auth: Bearer <rain_os_api_key> in Authorization header (key never leaves the header).

import express from 'express';
import { findUserByApiKey } from '../../services/dbService';
import { createOAuthState } from '../../services/oauthStateStore';

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const apiKey = getApiKey(req);
    if (!apiKey) {
      return res.status(401).json({ error: 'unauthorized', message: 'API key required in Authorization header' });
    }

    const user = await findUserByApiKey(apiKey);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'configuration_error', message: 'GitHub OAuth is not configured on the server' });
    }

    // Create a cryptographically random nonce — never exposes the API key in URLs
    const state = await createOAuthState(user.id);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `https://api.getrainos.com/api/github/oauth/callback`,
      scope: 'repo read:user',
      state,
    });

    const url = `https://github.com/login/oauth/authorize?${params}`;
    return res.status(200).json({ url });
  } catch (error) {
    console.error('GitHub OAuth init error:', error);
    res.status(500).json({ error: 'internal_server_error', message: 'Failed to initiate GitHub OAuth' });
  }
}
