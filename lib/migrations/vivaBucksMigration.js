import User from '@/models/User';
import connectDB from '@/lib/db';

/**
 * VivaBucks Phase 3 Migration Utility
 * 
 * Migrates existing user loyalty data to new VivaBucks Phase 3 schema:
 * - vivaBucks → availableVivaBucks
 * - cumulativePoints → totalVivaBucksEarned
 * - Updates tier system to EXPLORER/ADVENTURER/CHAMPION
 * - Initializes behavioral profiles
 */

export async function migrateUserToVivaBucksPhase3(userId) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Skip if already migrated
    if (user.dataVersion === '3.0' || user.totalVivaBucksEarned !== undefined) {
      console.log(`[Migration] User ${user.email} already migrated to Phase 3`);
      return user;
    }

    // Migration logic
    const migrationData = {
      // Sync VivaBucks data
      availableVivaBucks: user.vivaBucks || 0,
      totalVivaBucksEarned: user.cumulativePoints || user.vivaBucks || 0,
      
      // Update tier system
      currentTier: migrateUserTier(user.currentTier, user.cumulativePoints || user.vivaBucks || 0),
      pointsMultiplier: calculateTierMultiplier(user.cumulativePoints || user.vivaBucks || 0),
      
      // Initialize behavioral profile
      behaviorProfile: {
        type: 'BALANCED',
        confidence: 0.5,
        lastUpdated: new Date()
      },
      
      // Initialize empty arrays
      redemptionHistory: [],
      
      // Mark as migrated
      dataVersion: '3.0',
      lastUpdated: new Date()
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: migrationData },
      { new: true }
    );

    console.log(`[Migration] Successfully migrated user ${user.email} to VivaBucks Phase 3`);
    console.log(`[Migration] Available VivaBucks: ${migrationData.availableVivaBucks}`);
    console.log(`[Migration] Total Earned: ${migrationData.totalVivaBucksEarned}`);
    console.log(`[Migration] New Tier: ${migrationData.currentTier}`);

    return updatedUser;

  } catch (error) {
    console.error('[Migration] Failed to migrate user:', error);
    throw error;
  }
}

export async function migrateBulkUsersToVivaBucksPhase3(limit = 100) {
  try {
    await connectDB();
    
    // Find users that haven't been migrated yet
    const users = await User.find({
      $or: [
        { dataVersion: { $ne: '3.0' } },
        { totalVivaBucksEarned: { $exists: false } }
      ]
    }).limit(limit);

    console.log(`[Migration] Found ${users.length} users to migrate`);
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const user of users) {
      try {
        await migrateUserToVivaBucksPhase3(user._id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user._id,
          email: user.email,
          error: error.message
        });
      }
    }

    console.log(`[Migration] Bulk migration complete: ${results.success} success, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('[Migration] Bulk migration failed:', error);
    throw error;
  }
}

/**
 * Migrate old tier system to new VivaBucks tiers
 */
function migrateUserTier(oldTier, totalEarned) {
  // If already using new tier system
  if (['EXPLORER', 'ADVENTURER', 'CHAMPION'].includes(oldTier)) {
    return oldTier;
  }

  // Map old tiers to new system based on total earned
  if (totalEarned >= 7500) return 'CHAMPION';
  if (totalEarned >= 2500) return 'ADVENTURER';
  return 'EXPLORER';
}

/**
 * Calculate tier multiplier based on total earned
 */
function calculateTierMultiplier(totalEarned) {
  if (totalEarned >= 7500) return 2.0; // CHAMPION
  if (totalEarned >= 2500) return 1.5; // ADVENTURER
  return 1.0; // EXPLORER
}

/**
 * API endpoint to trigger migration for current user
 */
export async function migrateCurrentUser(userId) {
  if (!userId) {
    throw new Error('User ID required for migration');
  }

  return await migrateUserToVivaBucksPhase3(userId);
}

/**
 * Check if user needs migration
 */
export function userNeedsMigration(userData) {
  return !userData.dataVersion || 
         userData.dataVersion !== '3.0' || 
         userData.totalVivaBucksEarned === undefined;
} 