// src/pages/api/auth/verify-email.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { token } = await request.json();
    console.log('Received token:', token);

    await dbConnect();
    console.log('Database connected, searching for user...');
    
    const user = await User.findOne({ verificationToken: token });
    console.log('Found user:', user ? user.email : 'No user found');

    if (!user) {
      console.log('Invalid token or user not found');
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    console.log('Updating user verification status...');
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    console.log('User updated successfully:', user.email);

    const response = {
      success: true,
      message: 'Email verified successfully! Please sign in to continue.',
      isVerified: true,
      email: user.email
    };
    console.log('Sending response:', response);

    return NextResponse.json(response);

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
    console.log('GET verification request for token:', token?.substring(0, 10) + '...');

    if (!token) {
      console.log('No token provided in GET request');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 400 });
    }

    await dbConnect();
    console.log('Database connected, checking token...');
    
    const user = await User.findOne({ verificationToken: token });
    console.log('Token check result:', user ? 'Valid token' : 'Invalid token');

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 400 });
    }

    const response = {
      success: true,
      message: 'Valid verification token',
      isVerified: user.isVerified
    };
    console.log('Sending GET response:', { ...response, email: '***' });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error during verification' 
    }, { status: 500 });
  }
}