import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    
    // Extract userId from URL
    const userId = request.url.split('/')[6];
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use the new redeemReward method
    const result = await user.redeemReward();
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Return updated user data
    return NextResponse.json({
      vivaBucks: user.vivaBucks,
      rewardPoints: user.rewardPoints,
      cumulativePoints: user.cumulativePoints,
      currentTier: user.currentTier,
      pointsMultiplier: user.pointsMultiplier,
      redeemedAmount: result.rewardAmount,
      nextMilestone: user.nextRewardMilestone
    });

  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 