import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail';
import { REWARDS_CONFIG } from '@/lib/rewards/config';
import { RewardsUtils } from '@/lib/rewards/utils';
import mongoose from 'mongoose';
import { paymentTracker } from '@/lib/stripe/paymentTracker';

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

const processRewards = async (order, userId) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // Verify order hasn't been processed already
        const existingOrder = await Order.findById(order._id)
            .session(session)
            .select('rewardsProcessed');
            
        if (existingOrder?.rewardsProcessed) {
            console.log(`Order ${order._id} already processed`);
            return null;
        }

        const basePoints = Math.floor(order.total * REWARDS_CONFIG.POINTS_PER_DOLLAR);
        const result = await user.addPoints(basePoints, session);
        
        await Order.findByIdAndUpdate(
            order._id,
            {
                rewardsProcessed: true,
                pointsAwarded: result.adjustedPoints,
                rewardsProcessedAt: new Date()
            },
            { session, new: true }
        );

        await session.commitTransaction();
        return result;

    } catch (error) {
        console.error('Error processing rewards:', error);
        if (session?.inTransaction()) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

export async function POST(request) {
    console.log('🎣 Webhook endpoint hit');
    
    try {
        const rawBody = await request.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');

        console.log('📝 Webhook details:', {
            hasSignature: !!sig,
            bodyLength: rawBody.length,
            webhookSecret: !!WEBHOOK_SECRET
        });

        if (!sig) {
            console.error('❌ No Stripe signature found');
            return NextResponse.json(
                { error: 'No Stripe signature found' },
                { status: 400 }
            );
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
            console.log('✅ Webhook verified:', {
                type: event.type,
                id: event.id
            });
        } catch (err) {
            console.error('❌ Webhook verification failed:', {
                error: err.message,
                signature: sig?.substring(0, 20) + '...'
            });
            return NextResponse.json(
                { error: `Webhook Error: ${err.message}` },
                { status: 400 }
            );
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('💰 Processing payment intent succeeded:', paymentIntent.id);
                
                try {
                    await dbConnect();
                    const order = await createOrder(paymentIntent);
                    
                    // Process rewards only if it's a new order
                    if (order && paymentIntent.metadata.userId && !order.rewardsProcessed) {
                        try {
                            const user = await User.findById(paymentIntent.metadata.userId);
                            
                            if (user) {
                                const basePoints = Math.floor(order.total * REWARDS_CONFIG.POINTS_PER_DOLLAR);
                                const result = await user.addPoints(basePoints, false);
                                
                                await Order.findByIdAndUpdate(order._id, {
                                    rewardsProcessed: true,
                                    pointsAwarded: result.adjustedPoints
                                });

                                console.log('✅ Rewards processed:', {
                                    userId: user._id,
                                    basePoints,
                                    adjustedPoints: result.adjustedPoints,
                                    newTier: result.currentTier,
                                    multiplier: result.multiplier
                                });
                            }
                        } catch (rewardsError) {
                            console.error('❌ Failed to process rewards:', rewardsError);
                        }
                    }

                    // Let the confirmation endpoint handle the email sending
                    return NextResponse.json({ 
                        success: true,
                        orderId: order._id,
                        status: order.rewardsProcessed ? 'existing' : 'new'
                    });

                } catch (err) {
                    console.error('❌ Error processing payment:', err);
                    return NextResponse.json(
                        { error: err.message },
                        { status: 500 }
                    );
                }

            case 'payment_intent.created':
                const createdIntent = event.data.object;
                console.log('🆕 Payment intent created:', {
                    id: createdIntent.id,
                    amount: createdIntent.amount,
                    currency: createdIntent.currency
                });
                return NextResponse.json({ received: true });

            case 'charge.succeeded':
                const charge = event.data.object;
                console.log('💳 Charge succeeded:', {
                    id: charge.id,
                    amount: charge.amount,
                    status: charge.status
                });
                return NextResponse.json({ received: true });

            case 'charge.updated':
                const updatedCharge = event.data.object;
                console.log('📝 Charge updated:', {
                    id: updatedCharge.id,
                    amount: updatedCharge.amount,
                    status: updatedCharge.status
                });
                return NextResponse.json({ received: true });

            default:
                console.log(`ℹ️ Unhandled event type ${event.type}`);
                return NextResponse.json({ 
                    received: true,
                    message: `Unhandled event type: ${event.type}`
                });
        }
    } catch (err) {
        console.error('❌ General webhook error:', err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}
