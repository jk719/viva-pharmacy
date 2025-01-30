// src/pages/api/auth/verify-email.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { validateToken } from '@/lib/tokens';

export async function POST(request) {
  try {
    const { token } = await request.json();
    console.log('Received verification token:', token?.substring(0, 10) + '...');

    // Validate token format
    if (!validateToken(token)) {
      console.log('Invalid token format');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid verification token format' 
      }, { status: 400 });
    }

    await dbConnect();
    console.log('Database connected, searching for user...');
    
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });

    console.log('User lookup result:', {
      found: !!user,
      email: user?.email,
      isVerified: user?.isVerified,
      tokenExpiry: user?.verificationExpires
    });

    if (!user) {
      console.log('No user found with valid token');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      }, { status: 400 });
    }

    if (user.isVerified) {
      console.log('User already verified');
      return NextResponse.json({
        success: false,
        message: 'Email already verified'
      }, { status: 400 });
    }

    // Use updateOne to bypass validation
    const result = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          mustChangePassword: user.role === 'MANAGER' ? true : false
        },
        $unset: {
          verificationToken: "",
          verificationExpires: ""
        }
      }
    );

    console.log('Update result:', result);

    const response = {
      success: true,
      message: user.role === 'MANAGER' 
        ? 'Email verified successfully! Please set your permanent password.'
        : 'Email verified successfully! Please sign in to continue.',
      isVerified: true,
      email: user.email,
      userRole: user.role,
      mustChangePassword: user.role === 'MANAGER'
    };
    console.log('Sending response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error during verification',
      details: error.message 
    }, { status: 500 });
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
    
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() }
    });
    console.log('Token check result:', user ? 'Valid token' : 'Invalid token');

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid or expired token' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Valid verification token',
      isVerified: user.isVerified,
      userRole: user.role,
      mustChangePassword: user.role === 'MANAGER'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error during verification' 
    }, { status: 500 });
  }
}