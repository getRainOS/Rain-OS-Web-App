// api/auth/google.ts
// Handles user signup and login via Google OAuth ID Token.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByEmail, findUserByGoogleId, createUser, updateUser } from '../../services/dbService';
import type { User, ApiError } from '../../types';

// In a real app, you would use a library like 'google-auth-library'
// to verify the token. We will mock this for demonstration purposes.
const verifyGoogleToken = async (token: string): Promise<{ googleId: string; email: string; } | null> => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        console.warn("GOOGLE_CLIENT_ID is not set. Using a mock verification for development.");
        // This is a mock response. A real verification would hit Google's servers.
        if (token === "a_valid_google_id_token_from_client") {
            return { googleId: `mock_google_id_${Date.now()}`, email: `user_${Date.now()}@gmail.com` };
        }
        return null;
    }
    
    // Placeholder for real verification logic with `google-auth-library`
    // const {OAuth2Client} = require('google-auth-library');
    // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // try {
    //   const ticket = await client.verifyIdToken({
    //       idToken: token,
    //       audience: process.env.GOOGLE_CLIENT_ID,
    //   });
    //   const payload = ticket.getPayload();
    //   if (!payload || !payload.sub || !payload.email) return null;
    //   return { googleId: payload.sub, email: payload.email };
    // } catch (error) {
    //   console.error("Google token verification failed:", error);
    //   return null;
    // }
    
    // This part is for the mocked behavior when GOOGLE_CLIENT_ID is set but we are not using the library.
    // In a real app, you would remove this and use the commented-out block above.
    console.warn("Simulating Google token verification.");
    return { googleId: `sim_google_id_${Date.now()}`, email: `sim_user_${Date.now()}@gmail.com` };
}


export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { id_token } = req.body;

    if (!id_token) {
        return res.status(400).json({ error: 'bad_request', message: 'Google ID token is required.' } as ApiError);
    }
    
    const googleProfile = await verifyGoogleToken(id_token);

    if (!googleProfile) {
        return res.status(401).json({ error: 'unauthorized', message: 'Invalid Google ID token.' } as ApiError);
    }

    let user = await findUserByGoogleId(googleProfile.googleId);
    let statusCode = 200; // Assume existing user

    if (!user) {
        // If no user with this Google ID, check if an account with this email already exists
        user = await findUserByEmail(googleProfile.email);
        if (user) {
            // User exists, link their Google account
            await updateUser(user.id, { googleId: googleProfile.googleId });
        } else {
            // No user found, create a new one
            user = await createUser(googleProfile.email, undefined, googleProfile.googleId);
            statusCode = 201; // New user created
        }
    }

    const clientSafeUser: Partial<User> & { apiKey: string } = {
      id: user.id,
      email: user.email,
      apiKey: user.apiKey,
      subscriptionStatus: user.subscriptionStatus,
      usage: user.usage,
      createdAt: user.createdAt,
    };
    
    return res.status(statusCode).json(clientSafeUser);

  } catch (error) {
    console.error('Google Auth Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}