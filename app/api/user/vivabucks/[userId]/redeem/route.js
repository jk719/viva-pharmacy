import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { REWARDS_CONFIG } from '@/lib/rewards/config';

export async function POST(request) {
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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validation logic
    const availableReward = REWARDS_CONFIG.getRewardAmount(user.rewardPoints);
    if (availableReward === 0 || amount > availableReward) {
      return NextResponse.json({ 
        error: amount > availableReward ? 
          "Requested amount exceeds available rewards" : 
          "No rewards available to redeem" 
      }, { status: 400 });
    }

    // Calculate and update points
    const pointsToDeduct = (amount / 10) * 100;
    const previousPoints = user.rewardPoints;
    user.rewardPoints -= pointsToDeduct;
    user.vivaBucks += amount;

    // Record history with additional fields
    user.rewardHistory.push({
      type: 'REWARD_REDEEMED',
      timestamp: new Date(),
      amount,
      pointsUsed: pointsToDeduct,
      tier: user.currentTier,
      source: 'redemption',
      status: 'Redeemed',
      createdAt: new Date()
    });

    // Update rewards calculation
    user.calculateNextReward();

    await user.save();

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
    console.error('❌ Error redeeming reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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