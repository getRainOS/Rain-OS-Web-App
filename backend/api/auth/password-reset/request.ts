// api/auth/password-reset/request.ts
// Initiates the password reset process for a user.

// FIX: Use express.Request and express.Response to avoid conflicts with global types.
import express from 'express';
import { findUserByEmail, updateUser, hash } from '../../../services/dbService';
import { randomBytes } from 'crypto';
import type { ApiError } from '../../../types';

export default async function handler(req: express.Request, res: express.Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'bad_request', message: 'Email is required.' } as ApiError);
    }
    
    const user = await findUserByEmail(email);

    // Respond successfully even if user doesn't exist to prevent email enumeration
    if (user && user.hashedPassword) {
        const resetToken = randomBytes(32).toString('hex');
        const hashedToken = hash(resetToken);
        const expires = new Date(Date.now() + 3600000); // Token expires in 1 hour

        await updateUser(user.id, {
            passwordResetToken: hashedToken,
            passwordResetExpires: expires,
        });
        
        // In a real application, you would email the `resetToken` to the user.
        // For this headless example, we return it for the client to handle/simulate.
        return res.status(200).json({ 
            message: "Password reset token generated. In a real app, this would be sent to your email.",
            resetToken, // This is for simulation purposes ONLY.
        });
    }

    return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });

  } catch (error) {
    console.error('Password Reset Request Error:', error);
    return res.status(500).json({ error: 'internal_server_error', message: 'An internal server error occurred.' } as ApiError);
  }
}