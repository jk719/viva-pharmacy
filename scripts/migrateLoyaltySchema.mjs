import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateLoyaltySchema() {
  try {
    console.log('🔵 Starting loyalty schema migration...');
    await dbConnect();
    console.log('✅ Connected to database');

    const users = await User.find({ 'loyaltyProgram': { $exists: true } });
    console.log(`📊 Found ${users.length} users to migrate`);

    for (const user of users) {
      console.log(`🔄 Migrating user: ${user.email}`);
      
      // Initialize new fields with data from loyaltyProgram
      const updates = {
        vivaBucks: user.loyaltyProgram?.points || 0,
        cumulativePoints: user.loyaltyProgram?.points || 0,
        currentTier: user.loyaltyProgram?.tier || 'BRONZE',
        pointsMultiplier: user.loyaltyProgram?.multiplier || 1,
        coupons: user.loyaltyProgram?.coupons || [],
        rewardHistory: (user.loyaltyProgram?.transactions || []).map(trans => ({
          type: trans.type === 'earn' ? 'POINTS_EARNED' : 'POINTS_REDEEMED',
          points: trans.points,
          adjustedPoints: trans.points,
          multiplier: user.loyaltyProgram?.multiplier || 1,
          tier: user.loyaltyProgram?.tier || 'BRONZE',
          source: trans.description || 'migration',
          timestamp: trans.createdAt,
          createdAt: trans.createdAt,
          updatedAt: new Date()
        }))
      };

      // Update the user with new fields and remove old structure
      await User.findByIdAndUpdate(user._id, {
        $set: updates,
        $unset: { loyaltyProgram: "" }
      });

      console.log(`✅ Migrated user: ${user.email}`);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateLoyaltySchema()
  .then(() => {
    console.log('✅ Loyalty schema migration completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 