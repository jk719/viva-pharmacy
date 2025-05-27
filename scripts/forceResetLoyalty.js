const mongoose = require('mongoose');

// Database connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://viva-db:N$3GjPyL5qmM@cluster0.rk2zz.mongodb.net/viva-db?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Define user schema with all possible loyalty fields
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function forceResetAllLoyalty() {
  console.log('🔄 Starting COMPREHENSIVE loyalty reset...');
  
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to reset`);
    
    for (const user of users) {
      console.log(`🔄 Resetting user: ${user.email}`);
      
      // Remove ALL possible loyalty-related fields and set fresh ones
      const updateQuery = {
        $unset: {
          // Remove any old fields that might exist
          'loyaltyProgram': '',
          'cumulativeVivaBucks': '',
          'lifetimeVivaBucks': '',
          'totalVivaBucks': '',
          'earnedVivaBucks': '',
          'lifetimePoints': '',
          'totalPoints': '',
          'earnedPoints': '',
          'pointsBalance': '',
          'rewardsBalance': '',
          'loyaltyBalance': '',
          'loyaltyPoints': '',
          'points': '',
          'rewards': '',
        },
        $set: {
          // Set fresh values
          vivaBucks: 100,
          cumulativePoints: 100,
          currentTier: 'BRONZE',
          pointsMultiplier: 1,
          vivaBucksMultiplier: 1,
          rewardHistory: [],
          coupons: [],
          lastLoyaltyUpdate: new Date(),
          loyaltyResetTimestamp: new Date()
        }
      };
      
      await User.findByIdAndUpdate(user._id, updateQuery);
      console.log(`✅ Reset complete for: ${user.email}`);
    }
    
    // Delete all loyalty transactions
    console.log('🗑️ Deleting all loyalty transactions...');
    try {
      const LoyaltyTransaction = mongoose.model('LoyaltyTransaction', new mongoose.Schema({}, { strict: false }));
      const deleteResult = await LoyaltyTransaction.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} loyalty transactions`);
    } catch (e) {
      console.log('No loyalty transactions to delete or error:', e.message);
    }
    
    // Delete all orders
    console.log('🗑️ Deleting all orders...');
    try {
      const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
      const deleteResult = await Order.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} orders`);
    } catch (e) {
      console.log('No orders to delete or error:', e.message);
    }
    
    console.log('\n🎉 COMPREHENSIVE RESET COMPLETED!');
    console.log('All users now have:');
    console.log('- 100 VivaBucks');
    console.log('- 100 cumulative points');
    console.log('- BRONZE tier');
    console.log('- Empty transaction history');
    console.log('- No orders');
    
  } catch (error) {
    console.error('❌ Error during reset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Database disconnected');
    process.exit(0);
  }
}

// Run the reset
forceResetAllLoyalty(); 