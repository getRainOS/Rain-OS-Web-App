// api/auth/login.ts
// This endpoint handles user login with email and password.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByEmail, hash } from '../../services/dbService';
import type { User, ApiError } from '../../types';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'bad_request', message: 'Email and password are required.' } as ApiError);
    }
    
    const user = await findUserByEmail(email);

    // To prevent user enumeration, return a generic error for both non-existent users
    // and users who signed up via social login (and thus have no password).
    if (!user || !user.hashedPassword) {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid credentials.' } as ApiError);
    }

    const passwordHash = hash(password);
    if (passwordHash !== user.hashedPassword) {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid credentials.' } as ApiError);
    }

    // This is the only time the raw API key is sent to the client besides signup.
    // The client is responsible for storing it securely.
    const clientSafeUser: Partial<User> & { apiKey: string } = {
      id: user.id,
      email: user.email,
      apiKey: user.apiKey, // IMPORTANT: Sending the raw key
      subscriptionStatus: user.subscriptionStatus,
      usage: user.usage,
      createdAt: user.createdAt,
    };
    
    return res.status(200).json(clientSafeUser);

  } catch (error) {
    console.error('Login Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred during login.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}