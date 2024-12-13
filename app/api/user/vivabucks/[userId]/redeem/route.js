import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { REWARDS_CONFIG } from '@/lib/rewards/config';

export async function POST(request) {
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

    // Calculate available reward
    const availableReward = REWARDS_CONFIG.getRewardAmount(user.rewardPoints);
    if (availableReward === 0) {
      return NextResponse.json({ 
        error: "No rewards available to redeem" 
      }, { status: 400 });
    }

    // Use the redeemReward method
    const result = await user.redeemReward();
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      vivaBucks: user.vivaBucks,
      rewardPoints: user.rewardPoints,
      cumulativePoints: user.cumulativePoints,
      currentTier: user.currentTier,
      pointsMultiplier: REWARDS_CONFIG.MEMBERSHIP_TIERS[user.currentTier].multiplier,
      redeemedAmount: result.rewardAmount,
      nextMilestone: user.nextRewardMilestone
    });

  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 