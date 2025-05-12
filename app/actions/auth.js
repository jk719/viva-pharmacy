"use server";

import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/auth';
import { emailService } from '@/lib/email/emailService';

/**
 * Server action for user registration
 * 
 * @param {FormData} formData - Form data containing user details
 * @returns {Object} Result of the operation
 */
export async function registerUser(formData) {
  try {
    const name = formData.get('name');
    const email = formData.get('email')?.toLowerCase();
    const password = formData.get('password');
    const phoneNumber = formData.get('phoneNumber');

    if (!email || !password || !name) {
      return { 
        success: false, 
        message: 'Missing required fields',
        status: 400
      };
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { 
        success: false, 
        message: 'Email already registered',
        status: 400
      };
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const newUser = new User({
      email,
      password, // Will be hashed by pre-save middleware
      name,
      phoneNumber,
      verificationToken,
      verificationExpires,
      isVerified: false
    });

    await newUser.save();

    // Send verification email using the email service directly
    await emailService.sendVerificationEmail(email, verificationToken, name);

    return { 
      success: true, 
      message: 'Registration successful',
      status: 201
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Registration failed',
      status: 500
    };
  }
}

/**
 * Server action for requesting a password reset
 * 
 * @param {FormData} formData - Form data containing the email
 * @returns {Object} Result of the operation
 */
export async function requestPasswordReset(formData) {
  try {
    const email = formData.get('email');

    if (!email) {
      return { 
        success: false, 
        message: 'Email is required',
        status: 400
      };
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not
    if (!user) {
      return { 
        success: true, 
        message: 'If an account exists, a password reset link will be sent',
        status: 200
      };
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send reset email using the email service directly
    await emailService.sendPasswordResetEmail(
      { email, name: user.name || email }, 
      { resetToken, isManagerReset: false }
    );

    return { 
      success: true, 
      message: 'If an account exists, a password reset link will be sent',
      status: 200
    };

  } catch (error) {
    console.error('Password reset request error:', error);
    return { 
      success: false, 
      message: 'Failed to process password reset request',
      status: 500
    };
  }
}

/**
 * Server action for completing a password reset
 * 
 * @param {FormData} formData - Form data containing token and new password
 * @returns {Object} Result of the operation
 */
export async function resetPassword(formData) {
  try {
    const token = formData.get('token');
    const password = formData.get('password');

    if (!token || !password) {
      return { 
        success: false, 
        message: 'Token and password are required',
        status: 400
      };
    }

    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return { 
        success: false, 
        message: 'Invalid or expired reset token',
        status: 400
      };
    }

    // Update password and clear token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      success: true,
      message: 'Password reset successfully',
      email: user.email,
      status: 200
    };

  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'Failed to reset password',
      status: 500
    };
  }
}

/**
 * Server action for verifying an email
 * 
 * @param {FormData} formData - Form data containing the verification token
 * @returns {Object} Result of the operation
 */
export async function verifyEmail(formData) {
  try {
    const token = formData.get('token');
    
    if (!token) {
      return { 
        success: false, 
        message: 'No token provided',
        status: 400
      };
    }

    // Clean the token by decoding and removing any extra text
    const cleanToken = decodeURIComponent(token.split(' ')[0]);

    await dbConnect();

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      verificationToken: cleanToken,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return { 
        success: false, 
        message: 'Invalid or expired verification token',
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
      message: 'Server error during verification',
      status: 500
    };
  }
}

/**
 * Server action for resending a verification email
 * 
 * @param {FormData} formData - Form data containing the email
 * @returns {Object} Result of the operation
 */
export async function resendVerificationEmail(formData) {
  try {
    const email = formData.get('email');

    if (!email) {
      return { 
        success: false, 
        message: 'Email is required',
        status: 400
      };
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return { 
        success: false, 
        message: 'No account found with this email',
        status: 404
      };
    }

    if (user.isVerified) {
      return { 
        success: false, 
        message: 'Email is already verified',
        status: 400
      };
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.name);

    return {
      success: true,
      message: 'Verification email has been resent',
      status: 200
    };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { 
      success: false, 
      message: 'Failed to resend verification email',
      status: 500
    };
  }
}

/**
 * Server action for confirming a password reset with verification token
 * 
 * @param {FormData} formData - Form data containing token, password, and optional isManagerReset flag
 * @returns {Object} Result of the operation
 */
export async function confirmPasswordReset(formData) {
  try {
    const token = formData.get('token');
    const password = formData.get('password');
    const isManagerReset = formData.get('isManagerReset') === 'true';
    
    if (!token || !password) {
      return { 
        success: false, 
        message: 'Missing required fields',
        status: 400
      };
    }

    await dbConnect();

    // Find user with the token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return { 
        success: false, 
        message: 'Invalid or expired token',
        status: 400
      };
    }

    // Set the new password
    user.password = password;
    user.mustChangePassword = false;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    return {
      success: true,
      message: 'Password set successfully',
      status: 200
    };
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return { 
      success: false, 
      message: 'Server error during password reset',
      status: 500
    };
  }
} 