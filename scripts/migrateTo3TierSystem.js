require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

/**
 * Migration Script: Upgrade to 3-Tier VivaBucks System
 * 
 * This script migrates existing users from the old 7-tier system to the new simplified 3-tier system
 * and implements the unified VivaBucks model.
 */

// Tier mapping from old to new system
const TIER_MIGRATION_MAP = {
  BRONZE: 'EXPLORER',
  SILVER: 'ADVENTURER',
  GOLD: 'ADVENTURER',
  PLATINUM: 'CHAMPION',
  SAPPHIRE: 'CHAMPION',
  DIAMOND: 'CHAMPION',
  LEGEND: 'CHAMPION'
};

// New tier configuration
const NEW_TIER_CONFIG = {
  EXPLORER: { points: 0, multiplier: 1, couponAmount: 0 },
  ADVENTURER: { points: 1000, multiplier: 1.5, couponAmount: 15 },
  CHAMPION: { points: 5000, multiplier: 2, couponAmount: 50 }
};

// Helper function to determine correct tier from points
function getTierFromPoints(points) {
  if (points >= NEW_TIER_CONFIG.CHAMPION.points) return 'CHAMPION';
  if (points >= NEW_TIER_CONFIG.ADVENTURER.points) return 'ADVENTURER';
  return 'EXPLORER';
}

async function migrateTo3TierSystem() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('🚀 Starting migration to 3-tier VivaBucks system...');
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find all users with loyalty data
    const users = await usersCollection.find({
      $or: [
        { vivaBucks: { $exists: true } },
        { cumulativePoints: { $exists: true } },
        { cumulativeVivaBucks: { $exists: true } },
        { currentTier: { $exists: true } }
      ]
    }).toArray();
    
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        console.log(`\n👤 Processing user: ${user.email || user._id}`);
        
        // Extract current loyalty data
        const currentVivaBucks = user.vivaBucks || 0;
        const cumulativePoints = user.cumulativePoints || user.cumulativeVivaBucks || 0;
        const oldTier = user.currentTier || 'BRONZE';
        
        // Calculate new tier based on actual points earned
        const correctTier = getTierFromPoints(cumulativePoints);
        const migratedTier = TIER_MIGRATION_MAP[oldTier] || 'EXPLORER';
        
        // Use the higher tier (either calculated or migrated)
        const finalTier = cumulativePoints >= NEW_TIER_CONFIG[correctTier].points ? correctTier : migratedTier;
        
        // Prepare unified data structure
        const updateData = {
          // Unified VivaBucks model
          vivaBucks: Math.max(0, currentVivaBucks), // Available VivaBucks
          cumulativeVivaBucks: Math.max(0, cumulativePoints), // Total earned (for tier calculation)
          cumulativePoints: Math.max(0, cumulativePoints), // Keep for compatibility
          
          // New tier system
          currentTier: finalTier,
          pointsMultiplier: NEW_TIER_CONFIG[finalTier].multiplier,
          vivaBucksMultiplier: NEW_TIER_CONFIG[finalTier].multiplier, // For compatibility
          
          // Migration metadata
          migrationDate: new Date(),
          migrationVersion: '2.0',
          originalTier: oldTier,
          lastLoyaltyUpdate: new Date(),
          
          // Initialize arrays if they don't exist
          ...(user.rewardHistory ? {} : { rewardHistory: [] }),
          ...(user.coupons ? {} : { coupons: [] })
        };
        
        // Check if user qualifies for tier upgrade bonus
        let tierUpgradeBonus = 0;
        if (finalTier !== migratedTier && NEW_TIER_CONFIG[finalTier].couponAmount > 0) {
          tierUpgradeBonus = NEW_TIER_CONFIG[finalTier].couponAmount;
          
          // Add tier upgrade coupon to user's account
          if (!updateData.coupons) updateData.coupons = user.coupons || [];
          updateData.coupons.push({
            amount: tierUpgradeBonus,
            code: `UPGRADE${finalTier}${Date.now()}`,
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            isUsed: false,
            source: 'tier_migration',
            createdAt: new Date()
          });
        }
        
        // Update user in database
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        
        migrated++;
        
        console.log(`✅ Migrated user ${user.email || user._id}:`);
        console.log(`   Old tier: ${oldTier} → New tier: ${finalTier}`);
        console.log(`   Available VivaBucks: ${updateData.vivaBucks}`);
        console.log(`   Total earned: ${updateData.cumulativeVivaBucks}`);
        console.log(`   New multiplier: ${updateData.pointsMultiplier}x`);
        if (tierUpgradeBonus > 0) {
          console.log(`   🎁 Tier upgrade bonus: $${tierUpgradeBonus} coupon added`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email || user._id}:`, error.message);
        errors++;
      }
    }
    
    // Update loyalty transactions to reflect new tier names
    console.log('\n🔄 Updating loyalty transactions...');
    const loyaltyTransactionsCollection = db.collection('loyaltytransactions');
    
    for (const [oldTier, newTier] of Object.entries(TIER_MIGRATION_MAP)) {
      const result = await loyaltyTransactionsCollection.updateMany(
        { 'metadata.tier': oldTier },
        { $set: { 'metadata.tier': newTier, 'metadata.migrated': true } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   Updated ${result.modifiedCount} transactions: ${oldTier} → ${newTier}`);
      }
    }
    
    // Update special events to use new tier names
    console.log('\n🎯 Updating special events...');
    const specialEventsCollection = db.collection('specialevents');
    
    const events = await specialEventsCollection.find({
      applicableTiers: { $exists: true, $ne: [] }
    }).toArray();
    
    for (const event of events) {
      const updatedTiers = event.applicableTiers.map(tier => TIER_MIGRATION_MAP[tier] || tier);
      const uniqueTiers = [...new Set(updatedTiers)]; // Remove duplicates
      
      await specialEventsCollection.updateOne(
        { _id: event._id },
        { 
          $set: { 
            applicableTiers: uniqueTiers,
            lastMigrated: new Date()
          } 
        }
      );
      
      console.log(`   Updated event "${event.name}": ${event.applicableTiers.join(', ')} → ${uniqueTiers.join(', ')}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('='.repeat(50));
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Users migrated: ${migrated}`);
    console.log(`   ⏭️  Users skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📅 Migration date: ${new Date().toISOString()}`);
    
    // Create a migration log entry
    await db.collection('migrations').insertOne({
      type: '3-tier-system-migration',
      completedAt: new Date(),
      stats: {
        usersMigrated: migrated,
        usersSkipped: skipped,
        errors: errors,
        totalUsers: users.length
      },
      tierMapping: TIER_MIGRATION_MAP,
      newTierConfig: NEW_TIER_CONFIG
    });
    
    console.log('\n💡 Next steps:');
    console.log('   1. Deploy new tier configuration');
    console.log('   2. Update frontend components to use new tier names');
    console.log('   3. Test loyalty system functionality');
    console.log('   4. Monitor for any data inconsistencies');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Helper function to verify migration results
async function verifyMigration() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('\n🔍 Verifying migration results...');
    
    // Check tier distribution
    const tierCounts = await db.collection('users').aggregate([
      { $match: { currentTier: { $exists: true } } },
      { $group: { _id: '$currentTier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('\n📊 New tier distribution:');
    tierCounts.forEach(tier => {
      console.log(`   ${tier._id}: ${tier.count} users`);
    });
    
    // Check for any users with old tier names
    const oldTierUsers = await db.collection('users').find({
      currentTier: { $in: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'SAPPHIRE', 'DIAMOND', 'LEGEND'] }
    }).count();
    
    if (oldTierUsers > 0) {
      console.log(`⚠️  Warning: ${oldTierUsers} users still have old tier names`);
    } else {
      console.log('✅ All users successfully migrated to new tier system');
    }
    
    // Check data consistency
    const inconsistentUsers = await db.collection('users').find({
      $expr: {
        $ne: [
          '$pointsMultiplier',
          {
            $switch: {
              branches: [
                { case: { $eq: ['$currentTier', 'EXPLORER'] }, then: 1 },
                { case: { $eq: ['$currentTier', 'ADVENTURER'] }, then: 1.5 },
                { case: { $eq: ['$currentTier', 'CHAMPION'] }, then: 2 }
              ],
              default: 1
            }
          }
        ]
      }
    }).count();
    
    if (inconsistentUsers > 0) {
      console.log(`⚠️  Warning: ${inconsistentUsers} users have inconsistent multipliers`);
    } else {
      console.log('✅ All user multipliers are consistent with tier configuration');
    }
    
  } finally {
    await client.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateTo3TierSystem()
    .then(() => verifyMigration())
    .then(() => {
      console.log('\n🎉 Migration and verification completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateTo3TierSystem, verifyMigration }; 