// api/auth/google-callback.ts
// Handles the callback from Google OAuth and exchanges code for tokens

import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, findUserByGoogleId, createUser, updateUser } from '../../services/dbService';
import type { User, ApiError } from '../../types';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { code, error } = req.query;
    const APP_URL = process.env.APP_URL || 'https://app.getrainos.com';

    // Handle user cancellation or errors from Google
    if (error) {
      return res.redirect(`${APP_URL}/#/login?error=google_auth_cancelled`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${APP_URL}/#/login?error=missing_authorization_code`);
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${APP_URL}/#/login?error=google_oauth_not_configured`);
    }

    // Create OAuth2 client
    // Use explicit GOOGLE_CALLBACK_URL if set, otherwise construct from request
    const redirectUri = process.env.GOOGLE_CALLBACK_URL ||
                        `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Verify the ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.redirect(`${APP_URL}/#/login?error=invalid_google_token`);
    }

    const googleId = payload.sub;
    const email = payload.email;

    // Find or create user
    let user = await findUserByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      // Check if user exists with this email
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        // Link Google account to existing user
        await updateUser(existingUser.id, { googleId });
        // Refetch user to get updated data
        user = await findUserByGoogleId(googleId);
        if (!user) {
          throw new Error('Failed to link Google account');
        }
      } else {
        // Create new user
        user = await createUser(email, undefined, googleId);
        isNewUser = true;
      }
    }

    // Redirect to frontend with API key
    // The frontend uses HashRouter, so we need to redirect to /#/auth/callback with query params
    const redirectUrl = `${APP_URL}/#/auth/callback?apiKey=${encodeURIComponent(user.apiKey)}&googleAuth=success${isNewUser ? '&newUser=true' : ''}`;

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    const APP_URL = process.env.APP_URL || 'https://app.getrainos.com';
    const errorMessage = error instanceof Error ? error.message : 'authentication_failed';
    return res.redirect(`${APP_URL}/#/login?error=${encodeURIComponent(errorMessage)}`);
  }
}
