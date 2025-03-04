import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { token, password, isManagerReset } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user with the token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Set the new password
    user.password = password;
    user.mustChangePassword = false;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password set successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during password reset' },
      { status: 500 }
    );
  }
}
