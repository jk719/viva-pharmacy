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

export async function POST(request) {
    try {
        console.log('\n🔄 Webhook request received in:', IS_PRODUCTION ? 'production' : 'development');
        
        const rawBody = await request.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
            console.log('✅ Event constructed successfully:', event.type);
            
            // Add detailed logging for the event
            console.log('📦 Event details:', {
                type: event.type,
                id: event.id,
                object: event.object,
                apiVersion: event.api_version,
                data: {
                    object: {
                        id: event.data.object.id,
                        amount: event.data.object.amount,
                        status: event.data.object.status,
                        metadata: event.data.object.metadata
                    }
                }
            });

        } catch (err) {
            console.error('❌ Webhook verification failed:', err.message);
            return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const metadata = paymentIntent.metadata;

            try {
                await dbConnect();

                // Check for existing order
                const existingOrder = await Order.findOne({ paymentIntentId: paymentIntent.id });
                if (existingOrder) {
                    console.log('⚠️ Order already exists:', existingOrder._id);
                    return NextResponse.json({ received: true });
                }

                // Parse metadata
                const cartItems = JSON.parse(metadata.cartItems);
                const shippingAddress = JSON.parse(metadata.shippingAddress);
                const amount = Number(metadata.amount);  // This is in cents
                const userId = metadata.userId;
                const userEmail = metadata.userEmail;

                // Generate order number
                const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                // Create order with correct status
                const order = await Order.create({
                    orderNumber,
                    userId,
                    items: cartItems.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: Number(item.price),
                        quantity: Number(item.quantity) || 1,
                        image: item.image || `/images/products/${item.id}.png`
                    })),
                    total: amount,
                    status: 'Processing',
                    paymentStatus: 'Paid',
                    deliveryMethod: metadata.deliveryMethod,
                    selectedTime: metadata.selectedTime,
                    shippingAddress: metadata.deliveryMethod === 'delivery' ? shippingAddress : {
                        street: 'Pickup',
                        city: 'Pickup',
                        state: 'Pickup',
                        zipCode: 'Pickup',
                        country: 'US'
                    },
                    paymentIntentId: paymentIntent.id
                });

                console.log('✅ Order created:', orderNumber);

                // Update user rewards if authenticated
                if (userId !== 'guest') {
                    const user = await User.findById(userId);
                    if (user) {
                        // Convert amount from cents to dollars for points calculation
                        const amountInDollars = amount / 100;
                        const pointsToAdd = Math.floor(amountInDollars);
                        
                        console.log('💰 Reward points calculation:', {
                            amountInCents: amount,
                            amountInDollars,
                            pointsToAdd
                        });

                        const rewardsResult = await user.addPoints(pointsToAdd);
                        console.log('✨ Rewards updated:', rewardsResult);
                    }
                }

                // Send confirmation email
                if (userEmail) {
                    try {
                        const emailData = {
                            orderNumber,
                            customerName: userEmail.split('@')[0],
                            items: order.items.map(item => ({
                                name: item.name,
                                price: Number(item.price),
                                quantity: Number(item.quantity),
                                image: item.image
                            })),
                            subtotal: order.total - (order.tax || 0),
                            tax: order.tax || 0,
                            total: order.total,
                            shippingAddress: order.shippingAddress,
                            deliveryMethod: order.deliveryMethod,
                            selectedTime: order.selectedTime,
                            vivaBucksEarned: Math.floor((amount / 100) * 0.05), // 5% of dollar amount
                            rewardPointsEarned: Math.floor(amount / 100)  // 1 point per dollar
                        };

                        console.log('📧 Preparing email with data:', {
                            orderNumber: emailData.orderNumber,
                            itemsCount: emailData.items.length,
                            total: emailData.total
                        });

                        const emailHtml = generateOrderConfirmationEmail(emailData);
                        
                        await sendOrderConfirmationEmail(
                            userEmail,
                            `Viva Pharmacy Order Confirmation #${orderNumber}`,
                            emailHtml
                        );

                        order.emailSent = true;
                        await order.save();

                        console.log('✅ Confirmation email sent to:', userEmail);
                    } catch (emailError) {
                        console.error('❌ Email error:', emailError);
                    }
                }

                return NextResponse.json({ 
                    success: true,
                    orderId: order._id,
                    orderNumber
                });
            } catch (err) {
                console.error('❌ Error processing payment success:', err);
                return NextResponse.json({ error: err.message }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true });

    } catch (err) {
        console.error('❌ General webhook error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
