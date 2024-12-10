import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = request.url.split('/').pop();
    const data = await request.json();
    const { points } = data;

    if (!points || typeof points !== 'number') {
      return NextResponse.json({ error: "Invalid points value" }, { status: 400 });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add points and get updated rewards data
    const result = await user.addPoints(points);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add PUT method for redeeming rewards
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const userId = request.url.split('/').pop();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get reward amount before resetting
    const rewardAmount = user.getRewardAmount();
    
    if (rewardAmount === 0) {
      return NextResponse.json({ 
        error: "No reward available to redeem" 
      }, { status: 400 });
    }

    // Add VivaBucks and reset progress
    user.vivaBucks += rewardAmount;
    user.rewardPoints = user.nextRewardMilestone === 1000 ? 100 : 0; // Bonus points for 1000 milestone
    user.calculateNextReward();
    await user.save();

    return NextResponse.json({
      success: true,
      rewardAmount,
      newVivaBucks: user.vivaBucks,
      rewardPoints: user.rewardPoints,
      nextMilestone: user.nextRewardMilestone
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 