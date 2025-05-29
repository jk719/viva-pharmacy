import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { migrateUserToVivaBucksPhase3, userNeedsMigration } from '@/lib/migrations/vivaBucksMigration';

/**
 * GET /api/user/loyalty-status
 * 
 * Returns the current user's VivaBucks loyalty data
 * Supports Phase 3 contextual intelligence features
 */
export async function GET(request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user with loyalty data
    let user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Auto-migrate user to Phase 3 if needed
    if (userNeedsMigration(user)) {
      console.log(`[API] Auto-migrating user ${user.email} to VivaBucks Phase 3`);
      try {
        user = await migrateUserToVivaBucksPhase3(user._id);
      } catch (migrationError) {
        console.error('[API] Migration failed, using existing data:', migrationError);
        // Continue with existing data if migration fails
      }
    }

    // Extract loyalty data with Phase 3 enhancements
    const loyaltyData = {
      // Core VivaBucks data
      availableVivaBucks: user.availableVivaBucks || 0,
      totalVivaBucksEarned: user.totalVivaBucksEarned || 0,
      vivaBucks: user.availableVivaBucks || 0, // Alias for compatibility
      cumulativeVivaBucks: user.totalVivaBucksEarned || 0, // Alias for compatibility
      
      // User identification
      userId: user._id.toString(),
      email: user.email,
      name: user.name || user.email,
      
      // Tier system
      currentTier: calculateUserTier(user.totalVivaBucksEarned || 0),
      pointsMultiplier: getTierMultiplier(user.totalVivaBucksEarned || 0),
      
      // Profile data for contextual intelligence
      dateOfBirth: user.dateOfBirth || null,
      lastOrderDate: user.lastOrderDate || null,
      preferredRedemptionAmount: user.preferredRedemptionAmount || null,
      
      // Phase 3 behavioral data (if exists)
      behaviorProfile: user.behaviorProfile || null,
      redemptionHistory: user.redemptionHistory || [],
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      dataVersion: '3.0'
    };

    return NextResponse.json(loyaltyData);

  } catch (error) {
    console.error('[API] /api/user/loyalty-status error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch loyalty status' },
      { status: 500 }
    );
  }
}

/**
 * Calculate user tier based on total VivaBucks earned
 */
function calculateUserTier(totalEarned) {
  if (totalEarned >= 7500) return 'CHAMPION';
  if (totalEarned >= 2500) return 'ADVENTURER';
  return 'EXPLORER';
}

/**
 * Get tier multiplier for earning VivaBucks
 */
function getTierMultiplier(totalEarned) {
  const tier = calculateUserTier(totalEarned);
  
  switch (tier) {
    case 'CHAMPION': return 2.0;
    case 'ADVENTURER': return 1.5;
    case 'EXPLORER': 
    default: return 1.0;
  }
}

/**
 * PATCH /api/user/loyalty-status
 * 
 * Update user loyalty data (for optimistic updates confirmation)
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      availableVivaBucks, 
      totalVivaBucksEarned,
      behaviorProfile,
      lastActivity 
    } = body;

    await connectDB();

    // Update user loyalty data
    const updateData = {};
    
    if (typeof availableVivaBucks === 'number') {
      updateData.availableVivaBucks = Math.max(0, availableVivaBucks);
    }
    
    if (typeof totalVivaBucksEarned === 'number') {
      updateData.totalVivaBucksEarned = Math.max(0, totalVivaBucksEarned);
    }
    
    if (behaviorProfile) {
      updateData.behaviorProfile = behaviorProfile;
    }
    
    if (lastActivity) {
      updateData.lastOrderDate = new Date();
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: updateData,
        $push: lastActivity ? { 
          redemptionHistory: {
            $each: [lastActivity],
            $slice: -50 // Keep only last 50 entries
          }
        } : {}
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      availableVivaBucks: user.availableVivaBucks,
      totalVivaBucksEarned: user.totalVivaBucksEarned,
      currentTier: calculateUserTier(user.totalVivaBucksEarned || 0)
    });

  } catch (error) {
    console.error('[API] PATCH /api/user/loyalty-status error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update loyalty status' },
      { status: 500 }
    );
  }
} 