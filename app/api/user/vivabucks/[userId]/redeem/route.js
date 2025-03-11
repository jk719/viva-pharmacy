import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { REWARDS_CONFIG } from '@/lib/rewards/config';
import { RewardsUtils } from '@/lib/rewards/utils';
import mongoose from 'mongoose';

export async function POST(request) {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('🎯 Processing reward redemption...');
      
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      await dbConnect();
      const userId = request.url.split('/')[6];
      const { amount } = await request.json();

      console.log('Redemption request:', { userId, amount });

      const user = await User.findById(userId).session(session);
      const progress = RewardsUtils.calculateProgress(user.rewardPoints);
      
      if (progress.availableReward < amount) {
        await session.abortTransaction();
        return NextResponse.json({ 
          error: "Insufficient rewards balance",
          available: progress.availableReward 
        }, { status: 400 });
      }

      const pointsToDeduct = (amount / 10) * 100;
      const result = await User.findOneAndUpdate(
        {
          _id: userId,
          rewardPoints: user.rewardPoints // Optimistic lock
        },
        {
          $inc: { 
            rewardPoints: -pointsToDeduct,
            vivaBucks: amount
          },
          $push: {
            rewardHistory: {
              type: 'REWARD_REDEEMED',
              timestamp: new Date(),
              amount,
              pointsUsed: pointsToDeduct,
              tier: user.currentTier,
              source: 'redemption',
              status: 'Redeemed'
            }
          }
        },
        { new: true, session }
      );

      if (!result) {
        await session.abortTransaction();
        retryCount++;
        continue;
      }

      await session.commitTransaction();
      return NextResponse.json({
        success: true,
        vivaBucks: user.vivaBucks,
        rewardPoints: user.rewardPoints,
        cumulativePoints: user.cumulativePoints,
        currentTier: user.currentTier,
        pointsMultiplier: REWARDS_CONFIG.getMembershipTier(user.cumulativePoints).multiplier,
        redeemedAmount: amount,
        nextMilestone: user.nextRewardMilestone
      });
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Error redeeming reward:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
      session.endSession();
    }
  }

  return NextResponse.json({ 
    error: "Failed to process redemption after retries" 
  }, { status: 500 });
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = request.url.split('/')[6];

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('Raw reward history:', user.rewardHistory); // Debug log
    
    const filteredHistory = user.rewardHistory
      .filter(entry => entry.source !== 'test')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('Filtered history:', filteredHistory); // Debug log

    return NextResponse.json({
      history: filteredHistory,
      currentBalance: {
        vivaBucks: user.vivaBucks,
        rewardPoints: user.rewardPoints,
        currentTier: user.currentTier,
        nextMilestone: user.nextRewardMilestone,
        cumulativePoints: user.cumulativePoints,
        pointsMultiplier: REWARDS_CONFIG.getMembershipTier(user.cumulativePoints).multiplier
      }
    });

  } catch (error) {
    console.error('❌ Error fetching reward history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 