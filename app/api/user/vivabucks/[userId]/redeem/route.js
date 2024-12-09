import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = request.url.split('/')[6]; // Extract userId from URL
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate reward
    const rewardAmount = user.getRewardAmount();
    if (rewardAmount === 0) {
      return NextResponse.json({ error: "No reward available" }, { status: 400 });
    }

    // Add VivaBucks and handle points reset
    user.vivaBucks += rewardAmount;
    
    // Special handling for 1000-point milestone
    if (user.rewardPoints >= 1000) {
      user.rewardPoints = 100; // Bonus points
    } else {
      user.rewardPoints = user.rewardPoints % 100; // Keep excess points
    }

    await user.save();

    return NextResponse.json({
      vivaBucks: user.vivaBucks,
      rewardPoints: user.rewardPoints,
      cumulativePoints: user.cumulativePoints,
      currentTier: user.currentTier,
      pointsMultiplier: user.pointsMultiplier,
      redeemedAmount: rewardAmount
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}