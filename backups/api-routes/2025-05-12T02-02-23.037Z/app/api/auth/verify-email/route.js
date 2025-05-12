// src/pages/api/auth/verify-email.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { validateToken } from '@/lib/tokens';

export async function POST(req) {
  try {
    const { token } = await req.json();
    
    console.log('📝 Starting email verification process...');
    console.log('Received token:', token?.substring(0, 10) + '...');

    if (!token) {
      console.log('❌ Verification failed: No token provided');
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 400 }
      );
    }

    // Clean the token by decoding and removing any extra text
    const cleanToken = decodeURIComponent(token.split(' ')[0]);
    console.log('Cleaned token:', cleanToken.substring(0, 10) + '...');

    await dbConnect();

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      verificationToken: cleanToken,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Verification failed: Invalid or expired token');
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    console.log('✅ Valid token found for user:', user.email);

    // Update user verification status but preserve token for password reset if needed
    user.isVerified = true;
    if (!user.mustChangePassword) {
      // Only clear tokens if not a manager needing password setup
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
    }
    await user.save();

    console.log('🎉 Verification complete:', {
      email: user.email,
      isVerified: true,
      role: user.role,
      tokenCleared: user.verificationToken === undefined,
      mustChangePassword: user.mustChangePassword
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during verification' },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests for token verification without completing the process
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 400 });
    }

    // Clean the token by decoding and removing any extra text
    token = decodeURIComponent(token.split(' ')[0]);
    console.log('GET verification request for token:', token?.substring(0, 10) + '...');

    await dbConnect();
    
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid or expired token' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Valid token',
      isVerified: user.isVerified,
      role: user.role,
      mustChangePassword: user.mustChangePassword
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error during verification' 
    }, { status: 500 });
  }
}