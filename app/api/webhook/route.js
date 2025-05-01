import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail';
import mongoose from 'mongoose';
import { paymentTracker } from '@/lib/stripe/paymentTracker';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { LoyaltyCheckoutService } from '@/lib/checkout/loyaltyCheckoutService';
import loyaltyEventsService from '@/lib/loyalty/eventsService';
import { calculateTierFromPoints, TIER_CONFIG } from '@/lib/loyalty/loyaltyService';
import { twilioService } from '@/lib/sms/twilioService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const createOrder = async (paymentIntent, retryCount = 0) => {
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
};

const emitEvent = async (type, data) => {
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
};

const processPostOrderTasks = async (order) => {
    if (!order.emailSent) {
        try {
            const user = await User.findById(order.userId).select('email name');
            if (user && user.email) {
                const freshOrder = await Order.findById(order._id);
                if (freshOrder) {
                   await sendOrderConfirmationEmail(user.email, freshOrder);
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
};

export async function POST(req) {
  await dbConnect();
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      WEBHOOK_SECRET
    );

    console.log('📦 Webhook event received:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { metadata } = paymentIntent;
      const userId = metadata?.userId;
      const amount = paymentIntent.amount / 100;

      console.log('💳 Processing successful payment:', {
        paymentIntentId: paymentIntent.id,
        userId,
        amount
      });

      if (!userId) {
          console.error('❌ Webhook Error: Missing userId in paymentIntent metadata!', { paymentIntentId: paymentIntent.id });
          return NextResponse.json({ received: true, error: "Missing userId metadata" });
      }

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

          processPostOrderTasks(order).catch(err => {
               console.error("❌ Error in background post-order tasks for order:", order?._id, err);
          });

      } catch (orderCreationError) {
         console.error('❌ Failed to create or retrieve order in webhook:', orderCreationError, { paymentIntentId: paymentIntent.id });
         return NextResponse.json({ received: true, error: "Order processing failed" });
      }

      return NextResponse.json({
            received: true,
            orderId: order._id,
            status: order.loyaltyPointsProcessed ? 'processed' : 'processing_tasks'
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
     console.error('❌ Stripe Webhook Error:', err.message || err);
     if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
         return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
     }
     return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
