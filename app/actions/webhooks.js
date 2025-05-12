"use server";

import { cookies, headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import PrescriptionDelivery from '@/models/PrescriptionDelivery';
import { emailService } from '@/lib/email/emailService';
import mongoose from 'mongoose';
import { paymentTracker } from '@/lib/stripe/paymentTracker';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { LoyaltyCheckoutService } from '@/lib/checkout/loyaltyCheckoutService';
import loyaltyEventsService from '@/lib/loyalty/eventsService';
import { calculateTierFromPoints, TIER_CONFIG } from '@/lib/loyalty/loyaltyService';
import { twilioService } from '@/lib/sms/twilioService';
import { v4 as uuidv4 } from 'uuid';
import getProductModel from '@/models/Product';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Process Stripe webhook event
 * 
 * @param {FormData} formData - Contains the request body and signature
 * @returns {Object} Processing result
 */
export async function processStripeWebhook(formData) {
  const body = formData.get('body');
  const signature = formData.get('signature');
  
  // Validate required parameters
  if (!body || !signature) {
    return {
      success: false,
      message: 'Missing required parameters',
      status: 400
    };
  }

  try {
    await dbConnect();
    
    let event;
    const isTestMode = formData.get('isTestMode') === 'true';
    
    // Process event
    if (isTestMode) {
      try {
        event = JSON.parse(body);
      } catch (err) {
        return {
          success: false,
          message: 'Invalid JSON payload',
          status: 400
        };
      }
    } else {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          WEBHOOK_SECRET
        );
      } catch (err) {
        return {
          success: false,
          message: 'Webhook signature verification failed',
          status: 400
        };
      }
    }

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Check which type of payment this is
      if (paymentIntent.metadata.type === 'prescription_delivery') {
        // Process prescription delivery payments
        await handlePrescriptionDelivery(paymentIntent);
      } else {
        // Process regular orders
        await handleRegularOrder(paymentIntent);
      }
    }
    
    return {
      success: true,
      message: 'Webhook processed successfully',
      status: 200
    };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      success: false,
      message: 'Webhook processing failed',
      status: 500
    };
  }
}

/**
 * Process payment webhook event
 * 
 * @param {FormData} formData - Contains payment data
 * @returns {Object} Processing result
 */
export async function processPaymentWebhook(formData) {
  const bodyJson = formData.get('body');
  
  try {
    await dbConnect();
    const body = JSON.parse(bodyJson);
    const paymentIntent = body?.data?.object;
    
    if (!paymentIntent || !paymentIntent.id) {
      return { 
        success: false, 
        message: 'Invalid payment intent data', 
        status: 400 
      };
    }
    
    const { metadata } = paymentIntent;
    const userId = metadata?.userId;
    const amount = paymentIntent.amount / 100;

    if (!userId) {
      return { 
        success: false, 
        message: 'Missing userId in payment metadata', 
        status: 400 
      };
    }

    // Create order and process post-order tasks
    let order;
    try {
      order = await createOrder(paymentIntent);

      await emitEvent(Events.PAYMENT_COMPLETED, {
        userId: order.userId,
        paymentIntentId: paymentIntent.id,
        orderId: order._id,
        amount: amount,
        status: 'completed'
      });

      // Process post-order tasks in the background
      processPostOrderTasks(order).catch(err => {
        console.error("Error in background post-order tasks for order:", order?._id, err);
      });
    } catch (orderCreationError) {
      console.error('Failed to create or retrieve order in webhook:', orderCreationError, { paymentIntentId: paymentIntent.id });
      return { 
        success: false, 
        message: 'Order processing failed', 
        status: 500 
      };
    }

    return {
      success: true,
      orderId: order._id,
      status: order.loyaltyPointsProcessed ? 'processed' : 'processing_tasks',
      status: 200
    };
  } catch (error) {
    console.error('Payment webhook error:', error);
    return {
      success: false,
      message: 'Webhook handler failed',
      status: 500
    };
  }
}

// Helper functions

async function createOrder(paymentIntent, retryCount = 0) {
  await dbConnect();
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const existingOrder = await Order.findOne({ 
      paymentIntentId: paymentIntent.id 
    }).session(session);

    if (existingOrder) {
      console.log('ℹ️ Order already exists based on paymentIntentId:', existingOrder._id);
      await session.abortTransaction();
      return existingOrder;
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const metadata = paymentIntent.metadata || {};
    
    console.log('📦 Processing metadata:', {
      userId: metadata.userId,
      deliveryMethod: metadata.deliveryMethod,
      selectedTime: metadata.selectedTime,
      hasCartItems: !!metadata.cartItems,
      hasShippingAddress: !!metadata.shippingAddress
    });

    const existingOrderNumberCheck = await Order.findOne({ orderNumber }).session(session);
    if (existingOrderNumberCheck) {
      console.warn('⚠️ Order number collision detected, retrying:', orderNumber);
      await session.abortTransaction();
      if (retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        return createOrder(paymentIntent, retryCount + 1);
      } else {
        throw new Error(`Order number collision after ${retryCount} retries.`);
      }
    }

    const amountInDollars = paymentIntent.amount / 100;
    let cartItems = [];
    try {
      if (metadata.cartItems) {
        cartItems = JSON.parse(metadata.cartItems);
        if (!Array.isArray(cartItems)) {
          throw new Error('Parsed cartItems is not an array');
        }
      } else {
        console.warn('⚠️ cartItems metadata missing from PaymentIntent:', paymentIntent.id);
      }
    } catch (e) {
      console.error('❌ Failed to parse cartItems metadata:', e, metadata.cartItems);
      cartItems = [];
    }

    if (!metadata.userId || !metadata.deliveryMethod) {
      console.error('❌ Missing required metadata fields:', {
        hasUserId: !!metadata.userId,
        hasDeliveryMethod: !!metadata.deliveryMethod,
      });
      throw new Error(`Missing required metadata fields (userId, deliveryMethod)`);
    }

    let shippingAddress = {
      street: 'Store Pickup', city: 'Store Pickup', state: 'Store Pickup', zipCode: 'Store Pickup'
    };
    if (metadata.deliveryMethod === 'delivery') {
      try {
        if (metadata.shippingAddress) {
          shippingAddress = JSON.parse(metadata.shippingAddress);
        } else {
          console.warn('⚠️ shippingAddress metadata missing for delivery order:', paymentIntent.id);
          shippingAddress = { street: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A' };
        }
      } catch (e) {
        console.error('❌ Failed to parse shippingAddress metadata:', e, metadata.shippingAddress);
        shippingAddress = { street: 'Parse Error', city: '', state: '', zipCode: '' };
      }
    }

    const orderData = {
      orderNumber,
      userId: metadata.userId,
      items: cartItems.map(item => ({
        productId: item.id || item.productId || 'unknown',
        name: item.name || 'Unknown Item',
        price: parseFloat(item.p || item.price || 0),
        quantity: parseInt(item.q || item.quantity) || 1,
        image: item.image || null
      })),
      total: amountInDollars,
      subtotal: parseFloat(metadata.subtotal || 0),
      tax: parseFloat(metadata.tax || 0),
      shipping: parseFloat(metadata.shipping || 0),
      status: 'Processing',
      paymentStatus: 'Paid',
      deliveryMethod: metadata.deliveryMethod,
      selectedTime: metadata.selectedTime || 'N/A',
      shippingAddress,
      paymentIntentId: paymentIntent.id,
      loyaltyPointsProcessed: false,
      emailSent: false
    };

    console.log('📝 Creating order with data:', {
      orderNumber,
      userId: metadata.userId,
      itemCount: orderData.items.length,
      total: orderData.total,
      paymentIntentId: orderData.paymentIntentId
    });

    const createdOrders = await Order.create([orderData], { session });

    await session.commitTransaction();
    console.log('✅ Order created successfully:', createdOrders[0]._id);
    return createdOrders[0];
  } catch (error) {
    console.error('❌ Order creation transaction error:', error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

async function emitEvent(type, data) {
  console.log(`🚀 Emitting ${type} event:`, data ? { ...data, userId: data.userId ? '...' : undefined } : null);
  try {
    eventEmitter.emit(type, {
      ...data,
      type,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ Successfully emitted ${type} event`);
  } catch (error) {
    console.error(`❌ Error emitting ${type} event:`, error);
  }
}

async function processPostOrderTasks(order) {
  if (!order.emailSent) {
    try {
      const user = await User.findById(order.userId).select('email name');
      if (user && user.email) {
        const freshOrder = await Order.findById(order._id);
        if (freshOrder) {
          // Use the emailService directly
          await emailService.sendOrderConfirmationEmail(
            { email: user.email, name: user.name || user.email },
            {
              orderNumber: freshOrder.orderNumber,
              items: freshOrder.items,
              subtotal: freshOrder.subtotal || (freshOrder.total * 0.93),
              tax: freshOrder.tax || (freshOrder.total * 0.07),
              total: freshOrder.total,
              shippingAddress: freshOrder.shippingAddress,
              deliveryMethod: freshOrder.deliveryMethod,
              selectedTime: freshOrder.selectedTime,
              vivaBucksEarned: Math.floor(freshOrder.total) // Simple approximation
            }
          );
          
          await Order.updateOne({ _id: order._id }, { $set: { emailSent: true } });
          console.log('✉️ Order confirmation email sent to:', user.email);
        } else {
          console.error('❌ Order not found for sending email after creation:', order._id);
        }
      } else {
        console.warn('⚠️ User email not found for order confirmation:', order.userId);
      }
    } catch (emailErr) {
      console.error('❌ Error sending order confirmation email:', emailErr);
    }
  } else {
    console.log('ℹ️ Email already marked as sent for order:', order._id);
  }

  // Send SMS notification if necessary
  try {
    const user = await User.findById(order.userId).select('phoneNumber smsPreferences');
    if (user?.phoneNumber && user?.smsPreferences?.orderConfirmations) {
      const message = `Your Viva Pharmacy order #${order.orderNumber} (Total: $${order.total.toFixed(2)}) has been confirmed!`;
      await twilioService.sendSMS(user.phoneNumber, message);
      console.log('📱 SMS notification sent for order:', order.orderNumber);
    }
  } catch (smsError) {
    console.error('❌ Error sending SMS notification:', smsError);
  }

  // Process loyalty points
  if (!order.loyaltyPointsProcessed && order.userId) {
    try {
      const user = await User.findById(order.userId);
      if (!user) throw new Error(`User not found for loyalty processing: ${order.userId}`);

      const amount = order.total;
      const loyaltyBenefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(user, amount);

      user.vivaBucks = user.vivaBucks || 0;
      user.cumulativePoints = user.cumulativePoints || 0;
      user.currentTier = user.currentTier || 'BRONZE';
      user.pointsMultiplier = user.pointsMultiplier || TIER_CONFIG[user.currentTier]?.multiplier || 1;
      user.rewardHistory = user.rewardHistory || [];

      const oldPoints = user.vivaBucks;
      const oldLifetimePoints = user.cumulativePoints;

      console.log('📊 Calculating loyalty points:', {
        orderId: order.orderNumber,
        userId: user._id,
        amount,
        basePoints: loyaltyBenefits.basePoints,
        tierMultiplier: loyaltyBenefits.tierMultiplier,
        totalPoints: loyaltyBenefits.totalPoints,
      });

      user.vivaBucks += loyaltyBenefits.totalPoints;
      user.cumulativePoints += loyaltyBenefits.totalPoints;
      user.rewardHistory.push({
        type: 'POINTS_EARNED',
        points: loyaltyBenefits.basePoints,
        adjustedPoints: loyaltyBenefits.totalPoints,
        multiplier: loyaltyBenefits.tierMultiplier,
        tier: user.currentTier,
        source: 'purchase',
        orderId: order._id,
        appliedEvents: loyaltyBenefits.appliedEvents || [],
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newTier = calculateTierFromPoints(user.cumulativePoints);
      if (newTier !== user.currentTier) {
        const oldTier = user.currentTier;
        user.currentTier = newTier;
        user.pointsMultiplier = TIER_CONFIG[newTier]?.multiplier || 1;
        user.rewardHistory.push({
          type: 'TIER_CHANGED',
          oldTier: oldTier,
          newTier: newTier,
          orderId: order._id,
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✨ Tier Change: ${oldTier} -> ${newTier} for user ${user._id}`);
      }

      await user.save();

      await Order.updateOne({ _id: order._id }, { $set: { loyaltyPointsProcessed: true } });
      console.log('💯 Loyalty points processed successfully for order:', order._id);

      await loyaltyEventsService.emitLoyaltyUpdate(user._id, {
        type: 'ORDER_COMPLETE',
        orderId: order._id,
        paymentIntentId: order.paymentIntentId,
        amount: amount,
        points: loyaltyBenefits.totalPoints,
        vivaBucks: user.vivaBucks,
        loyaltyBenefits: {
          ...loyaltyBenefits,
          currentPoints: user.vivaBucks,
          lifetimePoints: user.cumulativePoints,
          currentTier: user.currentTier,
          oldPoints,
          oldLifetimePoints,
          tierChanged: newTier !== user.currentTier,
          oldTier: user.currentTier,
          newTier: newTier
        }
      });
    } catch (loyaltyError) {
      console.error('❌ Error processing loyalty benefits for order:', order._id, loyaltyError);
    }
  } else if (order.loyaltyPointsProcessed) {
    console.log('ℹ️ Loyalty points already processed for order:', order._id);
  }
}

async function handleRegularOrder(paymentIntent) {
  await dbConnect();
  
  try {
    const { metadata } = paymentIntent;
    const userId = metadata.userId;
    
    // Validate that this payment hasn't been processed before
    const existingOrder = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (existingOrder) {
      console.log(`Order already exists for payment ${paymentIntent.id}`);
      return;
    }
    
    // Parse cart items from metadata
    let cartItems = [];
    try {
      // If cart items are stored as a string in metadata, parse them
      if (metadata.cartItems) {
        cartItems = JSON.parse(metadata.cartItems);
      }
    } catch (error) {
      console.error('Error parsing cart items from metadata:', error);
    }
    
    // If cart items weren't stored in metadata or parsing failed,
    // we can try to retrieve them from the payment intent's description or other fields
    if (!cartItems || cartItems.length === 0) {
      console.warn('No cart items found in metadata. Using fallback data collection.');
      // This is a fallback that would need to be customized based on your payment flow
    }
    
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 6)}`;
    
    // Parse shipping address from metadata if available
    let shippingAddress = null;
    if (metadata.shippingAddress) {
      try {
        shippingAddress = JSON.parse(metadata.shippingAddress);
      } catch (error) {
        console.error('Error parsing shipping address:', error);
      }
    }
    
    // Create order record
    const order = new Order({
      orderNumber,
      userId,
      items: cartItems.map(item => ({
        productId: item.id || item._id || item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || item.imageUrl
      })),
      total: paymentIntent.amount / 100, // Convert cents to dollars
      status: 'Processing',
      deliveryMethod: metadata.deliveryMethod || 'delivery',
      selectedTime: metadata.selectedTime || 'default',
      shippingAddress: shippingAddress || {
        street: metadata.street || '',
        city: metadata.city || '',
        state: metadata.state || '',
        zipCode: metadata.zipCode || '',
        country: metadata.country || 'US'
      },
      paymentStatus: 'Paid',
      paymentIntentId: paymentIntent.id,
      notes: [{
        content: `Order created via Stripe payment (ID: ${paymentIntent.id})`,
        author: 'System',
        type: 'system'
      }]
    });
    
    await order.save();
    console.log(`Order ${orderNumber} created successfully for payment ${paymentIntent.id}`);
    
    // Update product inventory
    await updateInventory(cartItems);
    
    // Send order confirmation email
    const user = await User.findById(userId);
    if (user && user.email) {
      try {
        // Use emailService directly
        await emailService.sendOrderConfirmationEmail(
          { email: user.email, name: user.name || 'Valued Customer' },
          {
            orderNumber,
            customerName: user.name || 'Valued Customer',
            items: order.items,
            total: order.total,
            subtotal: order.total * 0.93, // Approximation if actual subtotal is not stored
            tax: order.total * 0.07, // Approximation if actual tax is not stored
            shippingAddress: order.shippingAddress,
            deliveryMethod: order.deliveryMethod,
            selectedTime: order.selectedTime,
            vivaBucksEarned: Math.floor(order.total) // Simple points calculation
          }
        );
        
        // Mark email as sent
        order.emailSent = true;
        await order.save();
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the process if email sending fails
      }
    }
    
    // Emit order created event
    eventEmitter.emit(Events.ORDER_CREATED, {
      orderId: order._id,
      userId: order.userId,
      total: order.total,
      type: 'ORDER_CREATED',
      timestamp: new Date().toISOString()
    });
    
    return order;
  } catch (error) {
    console.error('Error handling regular order:', error);
    throw error;
  }
}

async function updateInventory(items) {
  try {
    const Product = getProductModel();
    for (const item of items) {
      const productId = item.id || item._id || item.productId;
      const quantity = item.quantity || 1;
      
      if (!productId) continue;
      
      // Find product and update stock
      const product = await Product.findById(productId);
      if (product && typeof product.stock === 'number') {
        product.stock = Math.max(0, product.stock - quantity);
        await product.save();
        console.log(`Updated inventory for product ${productId}, new stock: ${product.stock}`);
      }
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    // Don't fail the process if inventory update fails
  }
}

async function handlePrescriptionDelivery(paymentIntent) {
  await dbConnect();
  const { metadata } = paymentIntent;
  const address = JSON.parse(metadata.address);
  const contact = JSON.parse(metadata.contact);

  try {
    // Calculate estimated delivery time
    const estimatedDelivery = calculateEstimatedDelivery(metadata.deliverySpeed);

    // Create delivery record
    const delivery = await PrescriptionDelivery.create({
      paymentIntentId: paymentIntent.id,
      userId: metadata.userId !== 'guest' ? metadata.userId : null,
      status: 'PENDING',
      deliverySpeed: metadata.deliverySpeed,
      amount: paymentIntent.amount,
      address: {
        street: address.street,
        apartment: address.apartment || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      contact: {
        name: contact.name,
        phone: contact.phone
      },
      estimatedDelivery
    });

    // Send confirmation email using emailService directly
    await emailService.sendDeliveryConfirmationEmail(
      { email: paymentIntent.receipt_email || contact.email, name: contact.name },
      {
        id: delivery._id,
        estimatedDelivery,
        address,
        contact,
        amount: paymentIntent.amount / 100,
        deliverySpeed: metadata.deliverySpeed
      }
    );

    // Update delivery status
    await delivery.updateOne({ status: 'CONFIRMED' });
    
    return delivery;
  } catch (error) {
    console.error('Error handling prescription delivery:', error);
    throw error;
  }
}

function calculateEstimatedDelivery(deliverySpeed) {
  const now = new Date();
  
  switch (deliverySpeed) {
    case 'ONE_HOUR':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'SAME_DAY':
      // Set to 6 PM today
      const sameDay = new Date(now);
      sameDay.setHours(18, 0, 0, 0);
      return sameDay;
    case 'NEXT_DAY':
      // Set to 6 PM tomorrow
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(18, 0, 0, 0);
      return nextDay;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
} 