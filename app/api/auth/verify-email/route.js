// src/pages/api/auth/verify-email.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { token } = await request.json();
    console.log('Received token:', token);

    await dbConnect();
    
    // Debug: Find the user
    const user = await User.findOne({ verificationToken: token });
    console.log('Found user:', user ? user.email : 'No user found');

    if (!user) {
      // Debug: Check all users and their tokens
      const allUsers = await User.find({}, 'email verificationToken');
      console.log('All users and their tokens:', allUsers);
      
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after use
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Verification error details:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 400 });
  }
}

// Optional: Handle GET requests for token verification without completing the process
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: AUTH_ERRORS.INVALID_TOKEN 
      }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: AUTH_ERRORS.INVALID_TOKEN 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Valid verification token',
      email: user.email
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: AUTH_ERRORS.SERVER_ERROR 
    }, { status: 500 });
  }
}