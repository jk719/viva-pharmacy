import { NextResponse } from 'next/server';
// import { getServerSession } from "next-auth/next"; // Removed unused import
// import { authOptions } from "@/lib/auth"; // Removed unused import
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { validatePassword } from '@/lib/auth/password';
import { generateToken, isTokenExpired } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email/sendEmail';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Initiating password reset for:', data.email);

    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ 
      email: data.email.toLowerCase(),
      role: data.isManagerReset ? 'MANAGER' : { $in: ['USER', 'MANAGER', 'ADMIN'] }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log('No user found with email:', data.email);
      return NextResponse.json(
        { message: 'If an account exists, a password reset email will be sent' },
        { status: 200 }
      );
    }

    const resetToken = generateToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(data.email, resetToken, user.name, data.isManagerReset);
    console.log('Reset email sent to:', data.email);

    return NextResponse.json(
      { message: 'If an account exists, a password reset email will be sent' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}