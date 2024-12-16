import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { REWARDS_CONFIG } from '@/lib/rewards/config';

export async function POST(request) {
  try {
    console.log('🔄 Processing reward restoration...');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = request.url.split('/')[6];
    const { amount } = await request.json();

    console.log('Restoration request:', { userId, amount });

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate that user has enough VivaBucks to restore
    if (user.vivaBucks < amount) {
      return NextResponse.json({ 
        error: "Insufficient VivaBucks balance for restoration" 
      }, { status: 400 });
    }

    // Find the most recent redemption for this amount
    const redemptionIndex = user.rewardHistory.findIndex(entry => 
      entry.type === 'REWARD_REDEEMED' && 
      entry.amount === amount
    );

    if (redemptionIndex === -1) {
      return NextResponse.json({ 
        error: "No matching redemption found to restore" 
      }, { status: 400 });
    }

    // Remove the redemption entry
    user.rewardHistory.splice(redemptionIndex, 1);

    // Restore the points (100 points per $10)
    const pointsToRestore = (amount / 10) * 100;
    user.rewardPoints += pointsToRestore;
    user.vivaBucks -= amount;

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
      nextMilestone: user.nextRewardMilestone
    });

  } catch (error) {
    console.error('❌ Error restoring reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 