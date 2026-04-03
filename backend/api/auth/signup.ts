// api/auth/signup.ts
// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { createUser, findUserByEmail } from '../../services/dbService';
import type { User, ApiError } from '../../types';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'bad_request', message: 'Email and password are required and must be strings.' } as ApiError);
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'bad_request', message: 'Password must be at least 8 characters long.' } as ApiError);
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'conflict', message: 'A user with this email already exists.' } as ApiError);
    }

    const newUser = await createUser(email, password);

    // This is the only time the raw API key is sent to the client.
    // The client is responsible for storing it securely.
    const clientSafeUser: Partial<User> & { apiKey: string } = {
      id: newUser.id,
      email: newUser.email,
      apiKey: newUser.apiKey,
      subscriptionStatus: newUser.subscriptionStatus,
      usage: newUser.usage,
      createdAt: newUser.createdAt,
    };
    
    return res.status(201).json(clientSafeUser);

  } catch (error) {
    console.error('Signup Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred during signup.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}