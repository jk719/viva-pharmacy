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

    if (processing) {
      return NextResponse.json(
        { error: 'Request in progress' },
        { status: 429 }
      );
    }
    
    processing = true;
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      processing = false;
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();
    const userId = request.url.split('/').pop();
    
    if (userId !== session.user.id) {
      processing = false;
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const user = await User.findById(userId);
    
    if (!user) {
      processing = false;
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    processing = false;
    return NextResponse.json({
      vivaBucks: user.vivaBucks || 0,
      rewardPoints: user.rewardPoints || 0,
      cumulativePoints: user.cumulativePoints || 0,
      currentTier: user.currentTier || 'Standard',
      pointsMultiplier: user.pointsMultiplier || 1,
      nextRewardMilestone: user.nextRewardMilestone || 100
    });
  } catch (error) {
    if (error.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'Retry-After': '5',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    processing = false;
    console.error('Error fetching VivaBucks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add POST method for adding points
export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
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
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('❌ Not authenticated');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = request.url.split('/').pop();
    const data = await request.json();
    console.log('Request Data:', data);

    const { points, source } = data;
    if (!points || typeof points !== 'number') {
      console.error('❌ Invalid points value:', points);
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      console.error('❌ User not found for ID:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate points with multiplier
    const multiplier = user.pointsMultiplier || 1;
    const adjustedPoints = points * multiplier;

    // Check and update tier
    const currentPoints = user.cumulativePoints;
    const tierInfo = RewardsUtils.getMembershipTier(currentPoints);

    // Atomic update
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
          nextRewardMilestone: Math.ceil((user.rewardPoints + adjustedPoints) / 100) * 100
        }
      },
      { new: true, session }
    );

    await session.commitTransaction();

    console.log('✅ Points updated successfully');
    return NextResponse.json({
      success: true,
      vivaBucks: updatedUser.vivaBucks,
      rewardPoints: updatedUser.rewardPoints,
      currentTier: updatedUser.currentTier,
      nextRewardMilestone: updatedUser.nextRewardMilestone
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error processing request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}
 