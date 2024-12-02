// src/pages/api/auth/register.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { 
  validatePassword, 
  generateVerificationToken, 
  sendVerificationEmail,
  AUTH_ERRORS 
} from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password, phoneNumber } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Valid email is required' 
      }, { status: 400 });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        message: passwordValidation.message,
        errors: passwordValidation.errors 
      }, { status: 400 });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: AUTH_ERRORS.EMAIL_IN_USE 
      }, { status: 400 });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      phoneNumber,
      verificationToken,
      isVerified: false,
      role: 'user'
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Still return success but with a warning
      return NextResponse.json({
        success: true,
        message: 'Account created but verification email failed to send. Please use resend verification option.',
        emailError: true
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification instructions.'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: AUTH_ERRORS.SERVER_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}