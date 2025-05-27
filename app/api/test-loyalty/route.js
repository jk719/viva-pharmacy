import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    await dbConnect();
    
    // Get user from database
    const user = await User.findById(session.user.id).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return raw user data for debugging
    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      userId: user._id,
      rawUserData: {
        vivaBucks: user.vivaBucks,
        cumulativeVivaBucks: user.cumulativeVivaBucks,
        cumulativePoints: user.cumulativePoints,
        currentTier: user.currentTier,
        pointsMultiplier: user.pointsMultiplier,
        vivaBucksMultiplier: user.vivaBucksMultiplier
      },
      normalizedData: {
        vivaBucks: typeof user.vivaBucks === 'number' ? user.vivaBucks : 0,
        cumulativeVivaBucks: typeof user.cumulativeVivaBucks === 'number' ? user.cumulativeVivaBucks : 
                             typeof user.cumulativePoints === 'number' ? user.cumulativePoints : 0,
        currentTier: user.currentTier || "BRONZE",
        pointsMultiplier: user.pointsMultiplier || user.vivaBucksMultiplier || 1,
        vivaBucksMultiplier: user.vivaBucksMultiplier || user.pointsMultiplier || 1,
      }
    });
    
  } catch (error) {
    console.error('Test loyalty API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 