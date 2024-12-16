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
    const data = await request.json();
    const { points } = data;

    if (!points || typeof points !== 'number') {
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add points and get updated user data
    const result = await user.addPoints(points, true);

    return NextResponse.json({
      success: true,
      ...result,
      message: `Added ${REWARDS_CONFIG.formatPoints(points)} points successfully`
    });

  } catch (error) {
    console.error('Error in test points endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    console.log('Resetting points for user:', session.user.id);

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset all reward-related fields
    user.rewardPoints = 0;
    user.cumulativePoints = 0;
    user.vivaBucks = 0;
    user.currentTier = 'STANDARD';
    user.pointsMultiplier = 1;
    user.nextRewardMilestone = 100;
    user.rewardHistory = [];

    await user.save();
    console.log('Points reset successfully for user:', session.user.id);

    return NextResponse.json({
      success: true,
      message: "Points reset successfully",
      user: {
        rewardPoints: user.rewardPoints,
        cumulativePoints: user.cumulativePoints,
        vivaBucks: user.vivaBucks,
        currentTier: user.currentTier,
        nextRewardMilestone: user.nextRewardMilestone
      }
    });

  } catch (error) {
    console.error('Error resetting points:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 