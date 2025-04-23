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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const createOrder = async (paymentIntent, retryCount = 0) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        
        // Check for existing order first
        const existingOrder = await Order.findOne({ 
            paymentIntentId: paymentIntent.id 
        }).session(session);

        if (existingOrder) {
            console.log('ℹ️ Order already exists:', existingOrder._id);
            await session.commitTransaction();
            return existingOrder;
        }

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const metadata = paymentIntent.metadata || {};
        
        // Log metadata for debugging
        console.log('📦 Processing metadata:', {
            userId: metadata.userId,
            deliveryMethod: metadata.deliveryMethod,
            selectedTime: metadata.selectedTime,
            hasCartItems: !!metadata.cartItems
        });

        // Check for existing order number within transaction
        const existingOrderNumber = await Order.findOne({ orderNumber }).session(session);
        if (existingOrderNumber && retryCount < 3) {
            await session.abortTransaction();
            return createOrder(paymentIntent, retryCount + 1);
        }

        const amount = parseFloat(metadata.amountInDollars || '0');
        let cartItems = [];
        try {
            cartItems = JSON.parse(metadata.cartItems || '[]');
        } catch (e) {
            console.error('Failed to parse cartItems:', e);
            cartItems = [];
        }

        // Validate required fields
        if (!metadata.userId || !metadata.deliveryMethod || !metadata.selectedTime) {
            throw new Error(`Missing required fields: ${JSON.stringify({
                hasUserId: !!metadata.userId,
                hasDeliveryMethod: !!metadata.deliveryMethod,
                hasSelectedTime: !!metadata.selectedTime
            })}`);
        }

        const shippingAddress = metadata.deliveryMethod === 'delivery' 
            ? JSON.parse(metadata.shippingAddress || '{}')
            : {
                street: 'Store Pickup',
                city: 'Store Pickup',
                state: 'Store Pickup',
                zipCode: 'Store Pickup'
            };

        const orderData = {
            orderNumber,
            userId: metadata.userId,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: parseFloat(item.p || item.price),
                quantity: parseInt(item.q || item.quantity) || 1,
                image: item.image
            })),
            total: amount,
            status: 'Processing',
            paymentStatus: 'Paid',
            deliveryMethod: metadata.deliveryMethod,
            selectedTime: metadata.selectedTime,
            shippingAddress,
            paymentIntentId: paymentIntent.id
        };

        // Log order data before creation
        console.log('📝 Creating order with data:', {
            orderNumber,
            userId: metadata.userId,
            itemCount: orderData.items.length,
            total: amount
        });

        const order = await Order.create([orderData], { session });

        await session.commitTransaction();
        console.log('✅ Order created successfully:', order[0]._id);
        return order[0];

    } catch (error) {
        console.error('❌ Order creation error:', error);
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        await session.endSession();
    }
};

const emitEvent = async (type, data) => {
    console.log(`🚀 Emitting ${type} event:`, data);
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

export async function POST(req) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('📦 Webhook event received:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { metadata } = paymentIntent;
      const userId = metadata.userId;
      const amount = (paymentIntent.amount / 100).toFixed(2);

      console.log('💳 Processing successful payment:', {
        paymentIntentId: paymentIntent.id,
        userId,
        amount
      });

      try {
        // First emit payment completion
        await emitEvent(Events.PAYMENT_COMPLETED, {
            userId,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100
        });

        // Process the order
        const order = await createOrder(paymentIntent);
        console.log('📦 Order created:', order._id);

        // --- Restore post-order logic ---
        // 1. Update user rewards/points
        try {
            const basePoints = Math.floor(order.total); // 1 point per $1 spent (customize as needed)
            const pointsUpdate = await User.findByIdAndUpdate(
                userId,
                { $inc: { vivaBucks: basePoints, rewardPoints: basePoints } },
                { new: true }
            );
            console.log('🎁 Points updated for user:', userId, 'Points:', basePoints);
        } catch (rewardsErr) {
            console.error('❌ Error updating points for user:', userId, rewardsErr);
        }

        // 2. Send order confirmation email
        try {
            // You may want to fetch the user's email if not present in metadata
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendOrderConfirmationEmail(user.email, order);
                console.log('✉️ Order confirmation email sent to:', user.email);
            } else {
                console.warn('⚠️ User email not found for order confirmation:', userId);
            }
        } catch (emailErr) {
            console.error('❌ Error sending order confirmation email:', emailErr);
        }

        // 3. Emit points updated event
        try {
            await emitEvent(Events.POINTS_UPDATED, {
                userId,
                amount,
                points: Math.floor(order.total),
                afterPayment: true,
                timestamp: new Date().toISOString()
            });
            console.log('🚀 POINTS_UPDATED event emitted for user:', userId);
        } catch (eventErr) {
            console.error('❌ Error emitting POINTS_UPDATED event:', eventErr);
        }
        // --- End restore ---

        return NextResponse.json({ 
            received: true,
            orderId: order._id
        });
      } catch (error) {
        console.error('Error processing payment success:', error);
        throw error;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
