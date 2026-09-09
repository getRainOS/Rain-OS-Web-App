// api/auth/confirm.ts
// Completes email confirmation for password-based signups.
import express from 'express';
import { findUserByConfirmationToken, updateUser, hash } from '../../services/dbService';
import type { ApiError } from '../../types';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'bad_request', message: 'Confirmation token is required.' } as ApiError);
    }

    const hashedToken = hash(token);
    const user = await findUserByConfirmationToken(hashedToken);

    if (!user) {
      return res.status(400).json({ error: 'bad_request', message: 'Confirmation link is invalid or has already been used.' } as ApiError);
    }

    await updateUser(user.id, {
      emailConfirmed: true,
      confirmationToken: null,
    });

    return res.status(200).json({ message: 'Email confirmed. You can now log in.' });

  } catch (error) {
    console.error('Email Confirmation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred during confirmation.';
    return res.status(500).json({ error: 'internal_server_error', message: errorMessage } as ApiError);
  }
}
