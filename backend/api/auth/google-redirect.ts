// api/auth/google-redirect.ts
// Initiates Google OAuth flow by redirecting to Google's OAuth consent screen

import express from 'express';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const APP_URL = process.env.APP_URL || 'https://app.getrainos.com';

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id.apps.googleusercontent.com') {
      return res.status(500).json({
        error: 'configuration_error',
        message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in your environment variables.'
      });
    }

    // The callback URL where Google will redirect after authentication
    // Use explicit GOOGLE_CALLBACK_URL if set, otherwise construct from request
    const redirectUri = process.env.GOOGLE_CALLBACK_URL ||
                        `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'openid email profile');
    googleAuthUrl.searchParams.append('access_type', 'online');
    googleAuthUrl.searchParams.append('prompt', 'select_account');

    // Redirect user to Google OAuth consent screen
    res.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Google OAuth Redirect Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage });
  }
}
