require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define simplified schemas for the reset operation
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  vivaBucks: { type: Number, default: 0 },
  cumulativePoints: { type: Number, default: 0 },
  currentTier: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'SAPPHIRE', 'DIAMOND', 'LEGEND'], default: 'BRONZE' },
  pointsMultiplier: { type: Number, default: 1 },
  rewardHistory: [{ type: Object }],
  coupons: [{ type: Object }]
}, { strict: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: Object }],
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
}, { strict: false, timestamps: true });

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["EARN", "SPEND", "EXPIRE", "ADJUST", "REFUND"], required: true },
  source: { type: String, required: true }
}, { strict: false, timestamps: true });

const loyaltyEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const LoyaltyTransaction = mongoose.models.LoyaltyTransaction || mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
const LoyaltyEvent = mongoose.models.LoyaltyEvent || mongoose.model('LoyaltyEvent', loyaltyEventSchema);

async function connectDB() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI not found in environment variables');
            process.exit(1);
        }
        
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
            console.log('✅ Connected to MongoDB');
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function resetLoyaltyAndOrders() {
    console.log('🔄 Starting loyalty and orders reset...');
    
    try {
        // 1. Reset all users' loyalty data
        console.log('📊 Resetting user loyalty data...');
        const userUpdateResult = await User.updateMany(
            {},
            {
                $set: {
                    vivaBucks: 100,
                    cumulativePoints: 100,
                    currentTier: 'BRONZE',
                    pointsMultiplier: 1,
                    rewardHistory: [],
                    coupons: []
                }
            }
        );
        console.log(`✅ Updated ${userUpdateResult.modifiedCount} users with reset loyalty data`);

        // 2. Delete all orders
        console.log('🗑️  Deleting all orders...');
        const orderDeleteResult = await Order.deleteMany({});
        console.log(`✅ Deleted ${orderDeleteResult.deletedCount} orders`);

        // 3. Delete all loyalty transactions
        console.log('🗑️  Deleting all loyalty transactions...');
        const loyaltyTxDeleteResult = await LoyaltyTransaction.deleteMany({});
        console.log(`✅ Deleted ${loyaltyTxDeleteResult.deletedCount} loyalty transactions`);

        // 4. Delete all loyalty events (optional - keeps the event definitions but removes data)
        console.log('🗑️  Deleting all loyalty events...');
        const loyaltyEventDeleteResult = await LoyaltyEvent.deleteMany({});
        console.log(`✅ Deleted ${loyaltyEventDeleteResult.deletedCount} loyalty events`);

        console.log('\n🎉 Reset completed successfully!');
        console.log(`
📊 Summary:
- Users reset: ${userUpdateResult.modifiedCount}
- Orders deleted: ${orderDeleteResult.deletedCount}
- Loyalty transactions deleted: ${loyaltyTxDeleteResult.deletedCount}
- Loyalty events deleted: ${loyaltyEventDeleteResult.deletedCount}

All users now have:
- 100 VivaBucks
- 100 cumulative points
- BRONZE tier
- Empty reward history
- No coupons
        `);

    } catch (error) {
        console.error('❌ Error during reset:', error);
        throw error;
    }
}

async function main() {
    try {
        await connectDB();
        await resetLoyaltyAndOrders();
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Handle script interruption
process.on('SIGINT', async () => {
    console.log('\n🛑 Script interrupted');
    await mongoose.connection.close();
    process.exit(0);
});

main(); 