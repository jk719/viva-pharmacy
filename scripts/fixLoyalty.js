require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

async function fixLoyalty() {
  try {
    const userEmail = process.argv[2];
    if (!userEmail) {
      console.error('❌ Please provide user email: node scripts/fixLoyalty.js your@email.com');
      process.exit(1);
    }

    console.log('🔧 Fixing Loyalty System...');
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to database');

    const db = client.db();
    
    // Find user
    const user = await db.collection('users').findOne({ email: userEmail });
    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }

    console.log(`\n📊 Current loyalty data:`);
    console.log({
      vivaBucks: user.vivaBucks || 0,
      cumulativePoints: user.cumulativePoints || 0
    });

    // Get unprocessed orders
    const unprocessedOrders = await db.collection('orders')
      .find({ 
        userId: user._id, 
        $or: [
          { loyaltyPointsProcessed: { $exists: false } },
          { loyaltyPointsProcessed: null },
          { loyaltyPointsProcessed: false }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`\n📦 Found ${unprocessedOrders.length} unprocessed orders:`);
    
    let totalVivaBucksToAdd = 0;
    const transactions = [];

    for (const order of unprocessedOrders) {
      const vivaBucksForOrder = Math.floor(order.total);
      totalVivaBucksToAdd += vivaBucksForOrder;
      
      console.log({
        orderNumber: order.orderNumber,
        total: order.total,
        vivaBucksToAward: vivaBucksForOrder,
        date: order.createdAt?.toISOString()
      });

      // Create transaction record
      transactions.push({
        userId: user._id.toString(),
        amount: vivaBucksForOrder,
        type: 'EARN',
        source: 'purchase',
        sourceId: order.paymentIntentId || order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          amount: order.total,
          tier: user.currentTier || 'BRONZE',
          retroactive: true
        },
        createdBy: user._id,
        createdAt: new Date(),
        status: 'completed'
      });

      // Mark order as processed
      await db.collection('orders').updateOne(
        { _id: order._id },
        { $set: { loyaltyPointsProcessed: true } }
      );
    }

    if (totalVivaBucksToAdd > 0) {
      console.log(`\n💰 Adding ${totalVivaBucksToAdd} VivaBucks to account...`);
      
      // Update user's VivaBucks
      const newVivaBucks = (user.vivaBucks || 0) + totalVivaBucksToAdd;
      const newCumulativePoints = (user.cumulativePoints || 0) + totalVivaBucksToAdd;
      
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            vivaBucks: newVivaBucks,
            cumulativePoints: newCumulativePoints,
            lastLoyaltyUpdate: new Date()
          }
        }
      );

      // Insert transaction records
      if (transactions.length > 0) {
        await db.collection('loyaltytransactions').insertMany(transactions);
      }

      console.log(`\n✅ Loyalty system fixed!`);
      console.log({
        previousVivaBucks: user.vivaBucks || 0,
        newVivaBucks,
        added: totalVivaBucksToAdd,
        previousCumulative: user.cumulativePoints || 0,
        newCumulative: newCumulativePoints,
        transactionsCreated: transactions.length
      });
    } else {
      console.log('\n✅ No VivaBucks to add - all orders already processed');
    }

    await client.close();

  } catch (error) {
    console.error('❌ Error fixing loyalty system:', error);
  } finally {
    process.exit(0);
  }
}

fixLoyalty(); 