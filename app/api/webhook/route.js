import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';
import { generateOrderConfirmationEmail } from '@/lib/email-templates/order-confirmation';
import { sendOrderConfirmationEmail } from '@/lib/email/sendEmail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const createOrder = async (paymentIntent, retryCount = 0) => {
    try {
        await dbConnect();
        
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const metadata = paymentIntent.metadata || {};
        
        // Check for existing order with this number
        const existingOrderNumber = await Order.findOne({ orderNumber });
        if (existingOrderNumber && retryCount < 3) {
            return createOrder(paymentIntent, retryCount + 1);
        }

        const amount = parseFloat(metadata.amountInDollars || '0');
        const cartItems = JSON.parse(metadata.cartItems || '[]');
        
        const shippingAddress = metadata.deliveryMethod === 'delivery' 
            ? JSON.parse(metadata.shippingAddress || '{}')
            : {
                street: 'Store Pickup',
                city: 'Store Pickup',
                state: 'Store Pickup',
                zipCode: 'Store Pickup'
            };

        const order = await Order.create({
            orderNumber,
            userId: metadata.userId,
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity) || 1,
                image: item.image
            })),
            total: amount,
            status: 'Processing',
            paymentStatus: 'Paid',
            deliveryMethod: metadata.deliveryMethod,
            selectedTime: metadata.selectedTime,
            shippingAddress,
            paymentIntentId: paymentIntent.id
        });

        console.log('✅ Order created successfully:', order._id);
        return order;

    } catch (error) {
        console.error('❌ Order creation error:', error);
        if (error.code === 11000 && retryCount < 3) { // Duplicate key error
            return createOrder(paymentIntent, retryCount + 1);
        }
        throw error;
    }
};

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');

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
            console.log(`✅ Event constructed successfully: ${event.type}`);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            return NextResponse.json(
                { error: `Webhook Error: ${err.message}` },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('💰 Processing payment intent succeeded:', paymentIntent.id);
                
                try {
                    const order = await createOrder(paymentIntent);
                    
                    // Send confirmation email
                    if (order && paymentIntent.metadata.userEmail) {
                        try {
                            const emailContent = generateOrderConfirmationEmail({
                                orderNumber: order.orderNumber,
                                customerName: paymentIntent.metadata.userEmail.split('@')[0], // Basic name extraction
                                items: order.items,
                                subtotal: order.total,
                                tax: 0, // Add if you have tax info
                                total: order.total,
                                shippingAddress: order.shippingAddress,
                                deliveryMethod: order.deliveryMethod,
                                selectedTime: order.selectedTime,
                                vivaBucksEarned: 0, // Add if you track this
                                rewardPointsEarned: 0 // Add if you track this
                            });

                            await sendOrderConfirmationEmail(
                                paymentIntent.metadata.userEmail,
                                emailContent
                            );
                            console.log('✅ Confirmation email sent to:', paymentIntent.metadata.userEmail);

                            // Update order with email status
                            await Order.findByIdAndUpdate(order._id, {
                                emailSent: true,
                                lastEmailAttempt: new Date(),
                                emailAttempts: 1
                            });
                            console.log('✅ Order updated with email status');
                        } catch (emailError) {
                            console.error('❌ Failed to send confirmation email:', emailError);
                            // Update order with failed email attempt
                            await Order.findByIdAndUpdate(order._id, {
                                lastEmailAttempt: new Date(),
                                $inc: { emailAttempts: 1 }
                            });
                        }
                    }

                    return NextResponse.json({ 
                        success: true, 
                        orderId: order._id 
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
