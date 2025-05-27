#!/usr/bin/env node

import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';

async function testLoyaltySystem() {
  try {
    console.log('🔧 Testing Loyalty System...');
    await dbConnect();
    console.log('✅ Connected to database');

    // Get a test user (replace with your email)
    const testEmail = process.argv[2];
    if (!testEmail) {
      console.error('❌ Please provide a test email: node scripts/testLoyaltySystem.js your@email.com');
      process.exit(1);
    }

    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.error(`❌ User not found: ${testEmail}`);
      process.exit(1);
    }

    console.log(`📊 Current user data for ${testEmail}:`);
    console.log({
      vivaBucks: user.vivaBucks || 0,
      cumulativePoints: user.cumulativePoints || 0,
      currentTier: user.currentTier || 'BRONZE',
      pointsMultiplier: user.pointsMultiplier || 1
    });

    // Test adding VivaBucks
    const testAmount = 25; // Add 25 VivaBucks
    
    console.log(`\n💰 Adding ${testAmount} VivaBucks...`);
    
    const originalVivaBucks = user.vivaBucks || 0;
    const originalCumulative = user.cumulativePoints || 0;
    
    user.vivaBucks = originalVivaBucks + testAmount;
    user.cumulativePoints = originalCumulative + testAmount;
    user.lastLoyaltyUpdate = new Date();
    
    await user.save();
    
    // Create transaction record
    const transaction = new LoyaltyTransaction({
      userId: user._id,
      amount: testAmount,
      type: 'EARN',
      source: 'test',
      sourceId: `test-${Date.now()}`,
      metadata: { test: true },
      createdBy: user._id,
      createdAt: new Date()
    });
    
    await transaction.save();
    
    console.log(`✅ Successfully added ${testAmount} VivaBucks!`);
    console.log(`📈 Updated user data:`);
    console.log({
      vivaBucks: user.vivaBucks,
      cumulativePoints: user.cumulativePoints,
      change: `+${testAmount}`,
      transactionId: transaction._id
    });
    
    console.log('\n🎯 Now test making a purchase to see if the progress bar animates!');
    
  } catch (error) {
    console.error('❌ Error testing loyalty system:', error);
  } finally {
    process.exit(0);
  }
}

testLoyaltySystem(); 