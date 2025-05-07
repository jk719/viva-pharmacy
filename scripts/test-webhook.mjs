// Test script to simulate a Stripe webhook event
// Run with: node scripts/test-webhook.mjs

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/webhooks/stripe';

// Simulated Stripe payment_intent.succeeded event
const createMockEvent = (userId) => {
  const paymentIntentId = `pi_${uuidv4().replace(/-/g, '')}`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Sample cart item - using standard "id" and "name" format
  const cartItems = [
    {
      id: "68067e0e743c687721c7a05a",
      name: "Advil Liqui-Gels Pain Reliever",
      price: 19.99,
      quantity: 1,
      image: "https://m.media-amazon.com/images/I/71NcqY+20eL._AC_SL1500_.jpg"
    }
  ];
  
  // Sample shipping address
  const shippingAddress = {
    street: "123 Test Street",
    city: "Test City",
    state: "NY",
    zipCode: "10001",
    country: "US"
  };

  // Format using standard Stripe event structure
  return {
    id: `evt_${uuidv4().replace(/-/g, '')}`,
    object: "event",
    api_version: "2023-10-16",
    created: timestamp,
    data: {
      object: {
        id: paymentIntentId,
        object: "payment_intent",
        amount: 1999, // In cents
        amount_received: 1999,
        currency: "usd",
        customer: null,
        metadata: {
          userId: userId,
          deliveryMethod: "delivery",
          selectedTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          cartItems: JSON.stringify(cartItems),
          shippingAddress: JSON.stringify(shippingAddress)
        },
        payment_method: "pm_card_visa",
        status: "succeeded"
      }
    },
    type: "payment_intent.succeeded"
  };
};

// Function to send the mock webhook event
const sendMockWebhook = async (userId) => {
  const mockEvent = createMockEvent(userId);
  console.log(`🔄 Sending mock Stripe event: ${mockEvent.type}`);
  console.log(`💳 Payment Intent ID: ${mockEvent.data.object.id}`);
  console.log(`📦 Cart Items: ${mockEvent.data.object.metadata.cartItems}`);
  
  try {
    const response = await fetch(LOCAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // For local testing, we use a header to bypass signature verification
        'X-Test-Mode': 'true'
      },
      body: JSON.stringify(mockEvent)
    });
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }
    
    console.log(`✅ Webhook response status: ${response.status}`);
    console.log('Response data:', responseData);
    
    return { success: response.ok, status: response.status, data: responseData };
  } catch (error) {
    console.error(`❌ Webhook test failed:`, error);
    return { success: false, error: error.message };
  }
};

// Main execution
(async () => {
  // You need to provide a valid user ID from your database
  const userId = process.argv[2] || "67e370b58234601d393ab86d"; // Default or use command line arg
  
  if (!userId) {
    console.error("❌ Please provide a valid user ID");
    process.exit(1);
  }
  
  console.log(`🚀 Testing webhook for user: ${userId}`);
  const result = await sendMockWebhook(userId);
  
  if (result.success) {
    console.log('✅ Webhook test completed successfully');
  } else {
    console.error('❌ Webhook test failed:', result.error || 'Unknown error');
    process.exit(1);
  }
})(); 