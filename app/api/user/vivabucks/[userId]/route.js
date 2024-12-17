import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { REWARDS_CONFIG } from '@/lib/rewards/config';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();
    const userId = request.url.split('/').pop();
    
    // Verify the user is requesting their own data
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Session user ID:', session.user.id);
    console.log('Request user ID:', userId);
    console.log('User found:', user ? user.email : 'No user found');

    return NextResponse.json({
      vivaBucks: user.vivaBucks || 0,
      rewardPoints: user.rewardPoints || 0,
      cumulativePoints: user.cumulativePoints || 0,
      currentTier: user.currentTier || 'Standard',
      pointsMultiplier: user.pointsMultiplier || 1,
      nextRewardMilestone: user.nextRewardMilestone || 100
    });
  } catch (error) {
    console.error('Error fetching VivaBucks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add POST method for adding points
export async function POST(request) {
  try {
    await dbConnect();
    const userId = request.url.split('/').pop();
    const data = await request.json();
    const { points, source } = data;
    
    // Webhook auth check - Fix the headers handling
    const headersList = await headers();
    const webhookAuth = await headersList.get('authorization');
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'stripe-webhook-key';
    const isWebhook = webhookAuth === `Bearer ${INTERNAL_KEY}`;
    
    if (!isWebhook) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      
      // Verify the user is updating their own points
      if (userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    if (!points || typeof points !== 'number') {
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Apply tier multiplier if applicable
    const multiplier = REWARDS_CONFIG.MEMBERSHIP_TIERS[user.currentTier]?.multiplier || 1;
    const adjustedPoints = Math.floor(points * multiplier); // Ensure points are whole numbers

    console.log('🎯 Adding points:', adjustedPoints);
    const result = await user.addPoints(adjustedPoints);
    
    return NextResponse.json({
      success: true,
      ...result,
      multiplier,
      originalPoints: points,
      adjustedPoints
    });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 