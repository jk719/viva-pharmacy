// src/pages/api/auth/resend-verification.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { 
  generateVerificationToken, 
  sendVerificationEmail, 
  AUTH_ERRORS 
} from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'No account found with this email' 
      }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is already verified' 
      }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Verification email has been resent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to resend verification email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}