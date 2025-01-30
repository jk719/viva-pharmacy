import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { validatePassword } from '@/lib/auth/password';
import { generateToken, isTokenExpired } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email/sendEmail';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Reset password request data:', data); // Debug log

    if (!data) {
      return NextResponse.json(
        { error: 'No request data provided' },
        { status: 400 }
      );
    }

    const { email, password, token, isManagerReset, action = 'complete' } = data;
    await dbConnect();

    // For token-based reset
    if (token) {
      const user = await User.findOne({ 
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      // Validate the password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json({ 
          error: passwordValidation.message 
        }, { status: 400 });
      }

      // Update password and clear reset token
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    }

    // For manager password set/reset
    if (isManagerReset) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const user = await User.findOne({ 
        email: session.user.email,
        role: 'MANAGER'
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Validate the password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json({ 
          error: passwordValidation.message 
        }, { status: 400 });
      }

      // Update password and clear mustChangePassword flag
      user.password = password;
      user.mustChangePassword = false;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    }

    // For initiating password reset
    if (action === 'initiate' && email) {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ 
        email: email.toLowerCase(),
        role: isManagerReset ? 'MANAGER' : { $in: ['USER', 'MANAGER', 'ADMIN'] }
      });

      if (!user) {
        return NextResponse.json(
          { message: 'If an account exists, a password reset email will be sent' },
          { status: 200 }
        );
      }

      const resetToken = generateToken();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      await sendPasswordResetEmail(email, resetToken, user.name, isManagerReset);

      return NextResponse.json(
        { message: 'Password reset email sent' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}