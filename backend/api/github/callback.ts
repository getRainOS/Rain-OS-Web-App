// api/github/callback.ts
// Handles the GitHub OAuth callback: exchanges code for access token,
// fetches the GitHub user profile, and links it to the Rain OS user.

import express from 'express';
import { findUserByApiKey, saveGithubAuth } from '../../services/dbService';

const APP_URL = process.env.APP_URL || 'https://getrainos.com';
const CALLBACK_URL = 'https://api.getrainos.com/api/github/oauth/callback';

export default async function handler(req: express.Request, res: express.Response) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${APP_URL}/#/settings?github=cancelled`);
  }

  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    return res.redirect(`${APP_URL}/#/settings?github=error&reason=missing_params`);
  }

  try {
    // Decode the state to get the Rain OS API key
    const apiKey = Buffer.from(state, 'base64url').toString('utf8');
    const user = await findUserByApiKey(apiKey);
    if (!user) {
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=invalid_state`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=not_configured`);
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: CALLBACK_URL,
      }),
    });

    if (!tokenRes.ok) {
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json() as any;
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token error:', tokenData.error_description);
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=token_denied`);
    }

    const accessToken = tokenData.access_token as string;

    // Fetch GitHub user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!profileRes.ok) {
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=profile_fetch_failed`);
    }

    const profile = await profileRes.json() as any;
    const githubId = String(profile.id);
    const githubLogin = profile.login as string;

    // Save GitHub auth to the user record
    await saveGithubAuth(user.id, githubId, githubLogin, accessToken);

    res.redirect(`${APP_URL}/#/settings?github=connected&login=${encodeURIComponent(githubLogin)}`);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    res.redirect(`${APP_URL}/#/settings?github=error&reason=internal_error`);
  }
}
