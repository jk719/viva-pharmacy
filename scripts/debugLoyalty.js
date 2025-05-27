#!/usr/bin/env node

import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import Order from '../models/Order.js';

async function debugLoyalty() {
  try {
    console.log('🔍 Debugging Loyalty System...');
    await dbConnect();
    console.log('✅ Connected to database');

    // Get user email from command line
    const userEmail = process.argv[2];
    if (!userEmail) {
      console.error('❌ Please provide user email: node scripts/debugLoyalty.js your@email.com');
      process.exit(1);
    }

    const user = await User.findOne({ email: userEmail });
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
    const recentOrders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total paymentIntentId loyaltyPointsProcessed createdAt');
    
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
    const recentTransactions = await LoyaltyTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('amount type source sourceId createdAt metadata');
    
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

    // Check for data inconsistencies
    console.log('\n⚠️ Data Consistency Check:');
    console.log('='.repeat(50));
    
    const earnTransactions = await LoyaltyTransaction.find({ 
      userId: user._id, 
      type: 'EARN' 
    });
    
    const spendTransactions = await LoyaltyTransaction.find({ 
      userId: user._id, 
      type: 'SPEND' 
    });
    
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

    // Manual fix option
    if (process.argv[3] === '--fix') {
      console.log('\n🔧 Applying manual fix...');
      user.vivaBucks = calculatedVivaBucks;
      user.cumulativePoints = totalEarned;
      await user.save();
      console.log('✅ User data corrected!');
    } else if (calculatedVivaBucks !== (user.vivaBucks || 0)) {
      console.log('\n💡 To fix inconsistency, run: node scripts/debugLoyalty.js', userEmail, '--fix');
    }

  } catch (error) {
    console.error('❌ Error debugging loyalty system:', error);
  } finally {
    process.exit(0);
  }
}

debugLoyalty(); 