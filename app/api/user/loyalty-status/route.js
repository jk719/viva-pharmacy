import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed
// import { authOptions } from '@/lib/auth'; // Removed
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
// Removed logger import
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig'; // Assuming tier logic is needed
import { getToken } from "next-auth/jwt"; // Import getToken

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(request) {
  // Remove previous logging of request object

  // Get token directly within the handler
  const token = await getToken({ req: request, secret });

  // Log the token retrieved by the handler
  console.log('Loyalty route handler getToken result:', JSON.stringify(token, null, 2));

  if (!token || !token.sub) { // Check the token retrieved HERE
    console.warn('Unauthorized access attempt to /api/user/loyalty-status (token check inside handler failed)'); 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub; // Use token.sub from the handler's token

  try {
    // const session = await getServerSession(authOptions); // Removed
    // if (!session || !session.user || !session.user.id) { // Removed
    //   logger.warn('Unauthorized access attempt to /api/user/loyalty-status'); // Removed
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Removed
    // } // Removed
    // const userId = session.user.id; // Removed

    await dbConnect();

    // Fetch only necessary loyalty fields
    const user = await User.findById(userId)
      .select('loyalty.vivaBucks loyalty.cumulativePoints loyalty.tier loyalty.multiplier')
      .lean(); // Use lean() for performance if not modifying the doc

    if (!user) {
      console.error(`User not found for ID: ${userId} in /api/user/loyalty-status`); // Use console.error
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Structure the response payload consistently
    const loyaltyData = {
      vivaBucks: user.loyalty?.vivaBucks || 0,
      cumulativePoints: user.loyalty?.cumulativePoints || 0,
      tier: user.loyalty?.tier || 'BRONZE', // Default to BRONZE if not set
      multiplier: user.loyalty?.multiplier || TIER_CONFIG[user.loyalty?.tier || 'BRONZE']?.multiplier || TIER_CONFIG.BRONZE.multiplier, // Default multiplier
      // Add any other essential fields needed by the frontend hook
    };
    
    console.log(`Successfully fetched loyalty status for user: ${userId}`);

    return NextResponse.json(loyaltyData);

  } catch (error) {
    console.error(`Error fetching loyalty status for user ${userId}:`, error); // Use console.error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 