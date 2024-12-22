import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define tiers directly if REWARDS_CONFIG is not working
const TIERS = {
  STANDARD: { name: 'STANDARD', threshold: 0, multiplier: 1 },
  SILVER: { name: 'SILVER', threshold: 1000, multiplier: 1.2 },
  GOLD: { name: 'GOLD', threshold: 2500, multiplier: 1.5 },
  PLATINUM: { name: 'PLATINUM', threshold: 5000, multiplier: 2 }
};

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

    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found for ID:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate points with multiplier
    const multiplier = user.pointsMultiplier || 1;
    const adjustedPoints = points * multiplier;

    // Update user's points
    user.vivaBucks = (user.vivaBucks || 0) + adjustedPoints;
    user.rewardPoints = (user.rewardPoints || 0) + adjustedPoints;
    user.cumulativePoints = (user.cumulativePoints || 0) + adjustedPoints;

    // Check and update tier
    const currentPoints = user.cumulativePoints;
    let newTier = TIERS.STANDARD;
    
    for (const tier of Object.values(TIERS)) {
      if (currentPoints >= tier.threshold) {
        newTier = tier;
      }
    }

    user.currentTier = newTier.name;
    user.pointsMultiplier = newTier.multiplier;

    // Update next reward milestone
    user.nextRewardMilestone = Math.ceil(user.rewardPoints / 100) * 100;

    await user.save();

    console.log('✅ Points updated successfully');
    return NextResponse.json({
      success: true,
      vivaBucks: user.vivaBucks,
      rewardPoints: user.rewardPoints,
      currentTier: user.currentTier,
      nextRewardMilestone: user.nextRewardMilestone
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 