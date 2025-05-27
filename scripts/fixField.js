import dbConnect from '../lib/dbConnect.js';
import mongoose from 'mongoose';

async function fixField() {
  try {
    await dbConnect();
    console.log('✅ Connected to database');
    
    // Use raw MongoDB operations
    const collection = mongoose.connection.collection('users');
    
    // First check what we have
    const users = await collection.find({}).toArray();
    console.log('\n🔍 Users with cumulativeVivaBucks field:');
    users.forEach(user => {
      if (user.cumulativeVivaBucks !== undefined) {
        console.log(`${user.email}: cumulativeVivaBucks = ${user.cumulativeVivaBucks}`);
      }
    });
    
    // Remove only the cumulativeVivaBucks field
    const result = await collection.updateMany(
      {},
      { 
        $unset: { 
          cumulativeVivaBucks: ''
        }
      }
    );
    
    console.log(`\n✅ Removed cumulativeVivaBucks from ${result.modifiedCount} users`);
    
    // Verify
    const afterUsers = await collection.find({}).toArray();
    console.log('\n✅ After cleanup:');
    afterUsers.forEach(user => {
      if (user.email === 'jamilkabir85@gmail.com') {
        console.log(`${user.email}:`, {
          vivaBucks: user.vivaBucks,
          cumulativeVivaBucks: user.cumulativeVivaBucks || 'REMOVED',
          cumulativePoints: user.cumulativePoints
        });
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixField(); 