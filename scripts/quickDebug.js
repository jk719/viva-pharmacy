require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function quickDebug() {
  try {
    const userEmail = process.argv[2];
    if (!userEmail) {
      console.error('❌ Please provide user email: node scripts/quickDebug.js your@email.com');
      process.exit(1);
    }

    console.log('🔍 Debugging Loyalty System...');
    
    // Connect to MongoDB using env variable
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ Connected to database');

    const db = client.db();
    
    // Find user
    const user = await db.collection('users').findOne({ email: userEmail });
    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }

    console.log(`\n📊 User Loyalty Data for ${userEmail}:`);
    console.log('='.repeat(50));
    console.log({
      userId: user._id,
      vivaBucks: user.vivaBucks || 0,
      cumulativePoints: user.cumulativePoints || 0,
      currentTier: user.currentTier || 'BRONZE',
      pointsMultiplier: user.pointsMultiplier || 1
    });

    // Get recent orders
    console.log('\n📦 Recent Orders:');
    console.log('='.repeat(50));
    const recentOrders = await db.collection('orders')
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    if (recentOrders.length === 0) {
      console.log('No orders found');
    } else {
      recentOrders.forEach(order => {
        console.log({
          orderNumber: order.orderNumber,
          total: order.total,
          loyaltyProcessed: order.loyaltyPointsProcessed,
          paymentIntentId: order.paymentIntentId,
          date: order.createdAt?.toISOString()
        });
      });
    }

    // Get recent loyalty transactions
    console.log('\n💰 Recent Loyalty Transactions:');
    console.log('='.repeat(50));
    const recentTransactions = await db.collection('loyaltytransactions')
      .find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    if (recentTransactions.length === 0) {
      console.log('No loyalty transactions found');
    } else {
      recentTransactions.forEach(tx => {
        console.log({
          amount: tx.amount,
          type: tx.type,
          source: tx.source,
          sourceId: tx.sourceId,
          date: tx.createdAt?.toISOString(),
          metadata: tx.metadata
        });
      });
    }

    // Data consistency check
    console.log('\n⚠️ Data Consistency Check:');
    console.log('='.repeat(50));
    
    const earnTransactions = await db.collection('loyaltytransactions')
      .find({ userId: user._id.toString(), type: 'EARN' })
      .toArray();
    
    const spendTransactions = await db.collection('loyaltytransactions')
      .find({ userId: user._id.toString(), type: 'SPEND' })
      .toArray();
    
    const totalEarned = earnTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSpent = spendTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const calculatedVivaBucks = totalEarned - totalSpent;
    
    console.log({
      totalEarned,
      totalSpent,
      calculatedVivaBucks,
      actualVivaBucks: user.vivaBucks || 0,
      difference: calculatedVivaBucks - (user.vivaBucks || 0),
      isConsistent: calculatedVivaBucks === (user.vivaBucks || 0)
    });

    await client.close();

  } catch (error) {
    console.error('❌ Error debugging loyalty system:', error);
  } finally {
    process.exit(0);
  }
}

quickDebug(); 