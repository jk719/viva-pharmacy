import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';

async function fixCumulativeVivaBucks() {
  try {
    await dbConnect();
    console.log('✅ Connected to database');
    
    // Update all users to remove the old cumulativeVivaBucks field
    const result = await User.updateMany(
      {},
      { 
        $unset: { 
          cumulativeVivaBucks: '' 
        }
      }
    );
    
    console.log(`✅ Removed cumulativeVivaBucks field from ${result.modifiedCount} users`);
    
    // Verify the fix
    const users = await User.find({}).select('email vivaBucks cumulativeVivaBucks cumulativePoints currentTier');
    
    console.log('\n📊 Updated user data:');
    console.log('='.repeat(60));
    users.forEach(user => {
      console.log({
        email: user.email,
        vivaBucks: user.vivaBucks || 0,
        cumulativeVivaBucks: user.cumulativeVivaBucks || 'REMOVED',  
        cumulativePoints: user.cumulativePoints || 0,
        currentTier: user.currentTier || 'BRONZE'
      });
    });
    
    console.log('\n🎉 Fix completed! Now clear your browser cache and refresh.');
    console.log('The loyalty banner should now show 100 VivaBucks correctly.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCumulativeVivaBucks(); 