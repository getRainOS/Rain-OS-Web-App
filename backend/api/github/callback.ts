// api/github/callback.ts
// Handles the GitHub OAuth callback: verifies nonce state, exchanges code for
// access token, fetches GitHub user profile, and links it to the Rain OS user.

import express from 'express';
import { findUserById, saveGithubAuth } from '../../services/dbService';
import { consumeOAuthState } from '../../services/oauthStateStore';

interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  token_type?: string;
  scope?: string;
}

interface GitHubUserProfile {
  id: number;
  login: string;
  name?: string;
  email?: string;
}

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
    // Consume the nonce from the DB — verifies the request came from us and retrieves userId
    const userId = await consumeOAuthState(state);
    if (!userId) {
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=invalid_or_expired_state`);
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=user_not_found`);
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

    const tokenData = await tokenRes.json() as GitHubTokenResponse;
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token error:', tokenData.error_description);
      return res.redirect(`${APP_URL}/#/settings?github=error&reason=token_denied`);
    }

    const accessToken = tokenData.access_token;

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

    const profile = await profileRes.json() as GitHubUserProfile;
    const githubId = String(profile.id);
    const githubLogin = profile.login;

    // Save GitHub auth to the user record (token is encrypted inside saveGithubAuth)
    await saveGithubAuth(user.id, githubId, githubLogin, accessToken);

    res.redirect(`${APP_URL}/#/repo-analysis?github=connected&login=${encodeURIComponent(githubLogin)}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('GitHub OAuth callback error:', message);
    res.redirect(`${APP_URL}/#/settings?github=error&reason=internal_error`);
  }
}
