// api/auth/sync.ts
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { findUserByEmail, createUser, updateUser } from '../../services/dbService';
import type { User, ApiError } from '../../types';

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // It's acceptable to log this error but the handler will fail if called
  console.error("Supabase credentials missing in backend environment.");
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized', message: 'Missing or invalid Authorization header.' } as ApiError);
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);

    if (supabaseError || !supabaseUser || !supabaseUser.email) {
      console.error('Supabase token verification failed:', supabaseError);
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid authentication token.' } as ApiError);
    }

    const email = supabaseUser.email;
    const googleId = supabaseUser.app_metadata?.provider === 'google' ? supabaseUser.id : undefined; // Supabase User ID isn't exactly Google ID, but it's the stable ID for Supabase.

    // Find or Create User in Local DB
    let user = await findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      try {
        // Create new user
        user = await createUser(email, undefined, googleId);
        isNewUser = true;

      } catch (createError: any) {
        // Handle Race Condition: If user was created by another parallel request
        if (createError.code === '23505' || createError.message?.includes('users_email_key')) {
           user = await findUserByEmail(email);
           if (!user) {
             throw new Error('Failed to recover from race condition: User not found after duplicate error.');
           }
        } else {
          throw createError;
        }
      }
    }

    // Return the API Key in the same format as the legacy login
    const clientSafeUser: Partial<User> & { apiKey: string } = {
        id: user.id,
        email: user.email,
        apiKey: user.apiKey,
        subscriptionStatus: user.subscriptionStatus,
        stripePriceId: user.stripePriceId,
        stripeCustomerId: user.stripeCustomerId,
        usage: user.usage,
        createdAt: user.createdAt,
    };

    return res.status(200).json(clientSafeUser);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during auth sync.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}
