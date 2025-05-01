import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; 
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import logger from '@/lib/logger';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig'; // Assuming tier logic is needed

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    logger.warn('Unauthorized access attempt to /api/user/loyalty-status');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await dbConnect();

    // Fetch only necessary loyalty fields
    const user = await User.findById(userId)
      .select('loyalty.vivaBucks loyalty.cumulativePoints loyalty.tier loyalty.multiplier')
      .lean(); // Use lean() for performance if not modifying the doc

    if (!user) {
      logger.error(`User not found for ID: ${userId} in /api/user/loyalty-status`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Structure the response payload consistently
    const loyaltyData = {
      vivaBucks: user.loyalty?.vivaBucks || 0,
      cumulativePoints: user.loyalty?.cumulativePoints || 0,
      tier: user.loyalty?.tier || 'BRONZE', // Default to BRONZE if not set
      multiplier: user.loyalty?.multiplier || TIER_CONFIG.BRONZE.multiplier, // Default multiplier
      // Add any other essential fields needed by the frontend hook
    };
    
    // Optional: Log successful fetch
    // logger.info(`Successfully fetched loyalty status for user: ${userId}`);

    return NextResponse.json(loyaltyData);

  } catch (error) {
    logger.error(`Error fetching loyalty status for user ${userId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 