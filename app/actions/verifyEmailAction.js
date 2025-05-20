"use server";

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User'; // Still needed for user.save()
import { findUserByToken } from '@/lib/auth'; // Import the new helper

/**
 * Server action for verifying an email
 * 
 * @param {Object} data - Object containing the verification token
 * @returns {Object} Result of the operation
 */
export async function verifyEmail(data) {
  try {
    const token = data.token;

    if (!token) {
      return { 
        success: false, 
        message: 'Verification token is required',
        status: 400
      };
    }

    const cleanToken = token.trim();

    await dbConnect();

    const user = await findUserByToken(cleanToken, 'verificationToken', 'verificationExpires');

    if (!user) {
      return { 
        success: false, 
        message: 'Invalid or expired verification token', // Consistent with AUTH_ERRORS.INVALID_TOKEN
        status: 400
      };
    }

    // Update user verification status but preserve token for password reset if needed
    user.isVerified = true;
    if (!user.mustChangePassword) {
      // Only clear tokens if not a manager needing password setup
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
    }
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully',
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      status: 200
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return { 
      success: false, 
      message: 'Server error during verification', // Consistent with AUTH_ERRORS.SERVER_ERROR
      status: 500
    };
  }
}
