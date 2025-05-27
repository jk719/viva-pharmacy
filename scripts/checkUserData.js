require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define simplified user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  vivaBucks: { type: Number, default: 0 },
  cumulativePoints: { type: Number, default: 0 },
  currentTier: { type: String, default: 'BRONZE' },
  pointsMultiplier: { type: Number, default: 1 }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUserData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get all users and their loyalty data
    const users = await User.find({}, {
      email: 1,
      name: 1,
      vivaBucks: 1,
      cumulativePoints: 1,
      currentTier: 1,
      pointsMultiplier: 1
    }).sort({ email: 1 });
    
    console.log('\n📊 Current User Loyalty Data:');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   VivaBucks: ${user.vivaBucks || 0}`);
      console.log(`   Cumulative Points: ${user.cumulativePoints || 0}`);
      console.log(`   Current Tier: ${user.currentTier || 'BRONZE'}`);
      console.log(`   Points Multiplier: ${user.pointsMultiplier || 1}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`Total users: ${users.length}`);
    console.log(`Users with 100 VivaBucks: ${users.filter(u => u.vivaBucks === 100).length}`);
    console.log(`Users with 114 VivaBucks: ${users.filter(u => u.vivaBucks === 114).length}`);
    console.log(`Average VivaBucks: ${users.reduce((sum, u) => sum + (u.vivaBucks || 0), 0) / users.length}`);
    
  } catch (error) {
    console.error('❌ Error checking user data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

checkUserData(); 