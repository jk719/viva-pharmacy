import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { REWARDS_CONFIG } from '@/lib/rewards/config';

export async function GET(request, { params }) {
  try {
    // Await params to get userId
    const { userId } = await params;
    console.log('Received request for user history. UserId:', userId);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    
    console.log('Session user:', session.user.id);
    console.log('Requested user:', userId);

    // Verify the user is requesting their own data
    if (userId !== session.user.id) {
      console.log('Unauthorized: User ID mismatch');
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await User.findById(userId)
      .select('rewardHistory')
      .sort({ 'rewardHistory.redeemedAt': -1 });
    
    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('Fetching reward history for user:', userId);
    console.log('Found history:', user.rewardHistory?.length || 0, 'entries');

    const response = {
      history: user.rewardHistory || [],
      config: {
        pointsNeeded: REWARDS_CONFIG.REWARD_RATE.POINTS_NEEDED,
        rewardAmount: REWARDS_CONFIG.REWARD_RATE.REWARD_AMOUNT
      }
    };

    console.log('Sending response:', {
      historyLength: response.history.length,
      config: response.config
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in reward history endpoint:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
} 