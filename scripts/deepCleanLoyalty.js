import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

async function deepCleanLoyalty() {
  try {
    await dbConnect();
    console.log('✅ Connected to database');
    
    // Get your specific user to check what fields exist
    const yourUser = await User.findOne({ email: 'jamilkabir85@gmail.com' }).lean();
    
    console.log('\n🔍 Raw user document (before clean):');
    console.log('='.repeat(80));
    console.log(JSON.stringify(yourUser, null, 2));
    
    // Update using raw MongoDB operations to ensure all variants are removed
    const collection = mongoose.connection.collection('users');
    
    const result = await collection.updateMany(
      {},
      { 
        $unset: { 
          cumulativeVivaBucks: '',
          lifetimeVivaBucks: '',
          totalVivaBucks: '',
          earnedVivaBucks: '',
          lifetimePoints: '',
          totalPoints: '',
          earnedPoints: '',
          pointsBalance: '',
          rewardsBalance: '',
          loyaltyBalance: '',
          loyaltyPoints: '',
          points: '',
          rewards: '',
          'loyaltyProgram.points': '',
          'loyaltyProgram.cumulativePoints': '',
          loyaltyProgram: ''
        },
        $set: {
          vivaBucks: 100,
          cumulativePoints: 100,
          currentTier: 'BRONZE',
          pointsMultiplier: 1,
          vivaBucksMultiplier: 1,
          lastCleanupTimestamp: new Date()
        }
      }
    );
    
    console.log(`\n✅ Deep cleaned ${result.modifiedCount} users`);
    
    // Verify the fix by getting the raw document again
    const cleanedUser = await User.findOne({ email: 'jamilkabir85@gmail.com' }).lean();
    
    console.log('\n🧹 Raw user document (after clean):');
    console.log('='.repeat(80));
    console.log(JSON.stringify(cleanedUser, null, 2));
    
    // Also check all users
    const allUsers = await User.find({}).select('email vivaBucks cumulativeVivaBucks cumulativePoints').lean();
    
    console.log('\n📊 All users after cleanup:');
    console.log('='.repeat(80));
    allUsers.forEach(user => {
      console.log({
        email: user.email,
        vivaBucks: user.vivaBucks,
        cumulativeVivaBucks: user.cumulativeVivaBucks || 'REMOVED',
        cumulativePoints: user.cumulativePoints
      });
    });
    
    console.log('\n🎉 Deep cleanup completed!');
    console.log('Now clear your browser cache and test the API again.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deepCleanLoyalty(); 