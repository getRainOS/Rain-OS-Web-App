// api/auth/password-reset/submit.ts
// Completes the password reset process with a valid token.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByPasswordResetToken, updateUser, hash } from '../../../services/dbService';
import type { ApiError } from '../../../types';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'bad_request', message: 'Token and new password are required.' } as ApiError);
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'bad_request', message: 'Password must be at least 8 characters long.' } as ApiError);
    }
    
    const hashedToken = hash(token);
    const user = await findUserByPasswordResetToken(hashedToken);

    if (!user) {
        return res.status(400).json({ error: 'bad_request', message: 'Password reset token is invalid or has expired.' } as ApiError);
    }
    
    const newHashedPassword = hash(newPassword);
    
    await updateUser(user.id, {
        hashedPassword: newHashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
    });
    
    return res.status(200).json({ message: "Password has been successfully reset." });

  } catch (error) {
    console.error('Password Reset Submit Error:', error);
    return res.status(500).json({ error: 'internal_server_error', message: 'An internal server error occurred.' } as ApiError);
  }
}