import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { REWARDS_CONFIG } from '@/lib/rewards/config';
import { RewardsUtils } from '@/lib/rewards/utils';
import rateLimit from '@/lib/rateLimit';
import mongoose from 'mongoose';

let processing = false;

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = request.url.split('/').pop();
    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limit check with user ID
    const rateLimitResult = await rateLimit.check(request, 120, 60000, 'vivabucks');
    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: 'Too many requests',
        retryAfter: rateLimitResult.retryAfter
      }, { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfter)
        }
      });
    }

    await dbConnect();
    const user = await User.findById(userId)
      .select('vivaBucks rewardPoints cumulativePoints currentTier pointsMultiplier nextRewardMilestone')
      .lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate rewards data
    const rewardsData = {
      ...user,
      availableReward: REWARDS_CONFIG.getRewardAmount(user.rewardPoints || 0),
      progress: REWARDS_CONFIG.calculateProgress(user.rewardPoints || 0),
      tierProgress: REWARDS_CONFIG.getProgressToNextTier(user.cumulativePoints || 0)
    };

    return NextResponse.json(rewardsData);

  } catch (error) {
    console.error('Error fetching VivaBucks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add POST method for adding points
export async function POST(request) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();
  
  try {
    const headersList = headers();
    const userId = request.url.split('/').pop();
    
    // Add user ID to headers for rate limiting
    headersList.set('x-user-id', userId);
    
    if (!rateLimit.check(request, 60)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('🔄 Processing POST request...');
    
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      console.error('❌ Not authenticated');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    console.log('Request Data:', data);

    const { points, source } = data;
    if (!points || typeof points !== 'number') {
      console.error('❌ Invalid points value:', points);
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    // Find user without session first
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found for ID:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate points with multiplier
    const multiplier = user.pointsMultiplier || 1;
    const adjustedPoints = Math.floor(points * multiplier);

    // Check and update tier
    const currentPoints = user.cumulativePoints || 0;
    const tierInfo = RewardsUtils.getMembershipTier(currentPoints + adjustedPoints);

    // Atomic update with transaction
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          vivaBucks: adjustedPoints,
          rewardPoints: adjustedPoints,
          cumulativePoints: adjustedPoints
        },
        $set: {
          currentTier: tierInfo.name,
          pointsMultiplier: tierInfo.multiplier,
          nextRewardMilestone: Math.ceil((currentPoints + adjustedPoints) / 100) * 100,
          'rewardHistory': [...user.rewardHistory, {
            type: 'POINTS_EARNED',
            points: points,
            adjustedPoints: adjustedPoints,
            multiplier: multiplier,
            tier: tierInfo.name,
            source: source || 'purchase',
            timestamp: new Date()
          }]
        }
      },
      { new: true, session: mongoSession }
    );

    await mongoSession.commitTransaction();

    console.log('✅ Points updated successfully');
    return NextResponse.json({
      success: true,
      vivaBucks: updatedUser.vivaBucks,
      rewardPoints: updatedUser.rewardPoints,
      currentTier: updatedUser.currentTier,
      nextRewardMilestone: updatedUser.nextRewardMilestone
    });

  } catch (error) {
    await mongoSession.abortTransaction();
    console.error('❌ Error processing request:', error);
    return NextResponse.json({ error: "Failed to update points" }, { status: 500 });
  } finally {
    await mongoSession.endSession();
  }
}
 