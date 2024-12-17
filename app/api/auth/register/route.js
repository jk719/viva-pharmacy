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
    const { email, password, phoneNumber } = body;

    // Input validation
    const validationErrors = {
      email: !email || !email.includes('@') ? 'Valid email is required' : null,
      password: validatePassword(password),
      phoneNumber: !phoneNumber ? 'Phone number is required' : null
    };

    // Check for validation errors
    const errors = Object.entries(validationErrors)
      .filter(([key, value]) => value && key !== 'password')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (validationErrors.password && !validationErrors.password.isValid) {
      errors.password = validationErrors.password.errors;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors 
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

    // Initialize rewards data
    const rewardsData = {
      vivaBucks: REWARDS_CONFIG.WELCOME_BONUS.VIVABUCKS,
      rewardPoints: REWARDS_CONFIG.WELCOME_BONUS.VIVABUCKS,
      cumulativePoints: REWARDS_CONFIG.WELCOME_BONUS.VIVABUCKS,
      currentTier: REWARDS_CONFIG.DEFAULT_TIER,
      welcomeBonus: REWARDS_CONFIG.WELCOME_BONUS.AMOUNT,
      welcomeBonusRedeemed: false,
      rewardsHistory: [{
        type: 'welcome_bonus',
        amount: REWARDS_CONFIG.WELCOME_BONUS.VIVABUCKS,
        description: 'Welcome Bonus Points',
        date: new Date()
      }]
    };

    // Create new user with rewards
    const user = new User({
      email: email.toLowerCase(),
      password,
      phoneNumber,
      verificationToken,
      isVerified: false,
      role: 'user',
      ...rewardsData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
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
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      message: AUTH_ERRORS.SERVER_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}