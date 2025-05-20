import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { emailService } from '@/lib/email/emailService';
import mongoose from 'mongoose';
import { paymentTracker } from '@/lib/stripe/paymentTracker';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { executePostOrderTasks } from '@/lib/order/postOrderService';

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

          await executePostOrderTasks(order.toObject());

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
