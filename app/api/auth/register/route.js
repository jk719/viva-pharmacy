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
import { REWARDS_CONFIG } from '@/lib/rewards/config';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('Registration request body:', body); // Debug log

    const { email, password, phoneNumber } = body;

    // Input validation
    if (!email || !password || !phoneNumber) {
      console.log('Missing required fields:', { email: !!email, password: !!password, phone: !!phoneNumber });
      return NextResponse.json({ 
        success: false, 
        message: 'All fields are required',
        errors: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          phoneNumber: !phoneNumber ? 'Phone number is required' : null
        }
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

    // Initialize rewards data with the correct schema structure
    const rewardsData = {
      vivaBucks: REWARDS_CONFIG.WELCOME_BONUS.POINTS,
      rewardPoints: REWARDS_CONFIG.WELCOME_BONUS.POINTS,
      cumulativePoints: REWARDS_CONFIG.WELCOME_BONUS.POINTS,
      currentTier: 'STANDARD', // Match the tier case in the schema
      pointsMultiplier: 1.0,
      nextRewardMilestone: 100,
      rewardHistory: [{
        type: 'POINTS_EARNED',
        points: REWARDS_CONFIG.WELCOME_BONUS.POINTS,
        adjustedPoints: REWARDS_CONFIG.WELCOME_BONUS.POINTS,
        multiplier: 1.0,
        tier: 'STANDARD',
        source: 'welcome_bonus',
        timestamp: new Date()
      }]
    };

    // Create new user with rewards
    const user = new User({
      email: email.toLowerCase(),
      password,
      phoneNumber,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isVerified: false,
      role: 'USER', // Matches the enum case
      lastVerificationSent: new Date(),
      ...rewardsData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Send verification email
    try {
      console.log('Attempting to send verification email to:', email);
      await sendVerificationEmail(email, verificationToken);
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Email error details:', {
        error: emailError.message,
        stack: emailError.stack,
        email: email
      });
      return NextResponse.json({
        success: true,
        userId: user._id,
        rewards: {
          vivaBucks: rewardsData.vivaBucks,
          welcomeBonus: rewardsData.welcomeBonus
        },
        message: 'Account created with rewards! Verification email failed to send. Please use resend option.',
        emailError: true
      }, { status: 201 });
    }

    // Success response with rewards info
    return NextResponse.json({
      success: true,
      userId: user._id,
      rewards: {
        vivaBucks: rewardsData.vivaBucks,
        welcomeBonus: rewardsData.welcomeBonus
      },
      message: 'Account created successfully with rewards! Please check your email for verification.'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error details:', {
      error: error.message,
      stack: error.stack,
      type: error.name
    });
    return NextResponse.json({ 
      success: false, 
      message: AUTH_ERRORS.SERVER_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}