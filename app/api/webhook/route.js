import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET;

export async function POST(request) {
    try {
        console.log('\n🔄 Webhook request received');
        
        const rawBody = await request.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');
        
        if (!WEBHOOK_SECRET) {
            console.error('❌ Webhook secret is missing');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
            console.log('✅ Event constructed successfully:', event.type);
        } catch (err) {
            console.error('❌ Webhook verification failed:', {
                error: err.message,
                sigHeader: sig?.substring(0, 20) + '...',
                bodyLength: rawBody.length
            });
            return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
        }

        // Handle payment_intent.succeeded
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            
            try {
                // Retrieve the complete payment intent
                const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
                
                console.log('💳 Full Payment Intent:', {
                    id: fullPaymentIntent.id,
                    amount: fullPaymentIntent.amount,
                    metadata: fullPaymentIntent.metadata
                });

                // Check if we need to process this payment
                if (!fullPaymentIntent.metadata?.cartItemIds) {
                    console.log('⏭️ Skipping payment without cart items');
                    return NextResponse.json({ received: true });
                }

                await dbConnect();

                // Parse cart items
                const cartItems = JSON.parse(fullPaymentIntent.metadata.cartItemIds);
                console.log('📦 Cart items:', cartItems);

                // Base order data
                const orderData = {
                    userId: fullPaymentIntent.metadata.userId,
                    items: cartItems.map(item => ({
                        productId: item.id.toString(),
                        name: item.name,
                        quantity: item.qty,
                        price: parseFloat(item.price)
                    })),
                    total: fullPaymentIntent.amount / 100,
                    status: 'Pending',
                    paymentStatus: 'Paid',
                    paymentIntentId: fullPaymentIntent.id,
                    deliveryMethod: fullPaymentIntent.metadata.deliveryMethod || 'delivery',
                    selectedTime: fullPaymentIntent.metadata.selectedTime || '9:00 AM'
                };

                // Only add shipping address if delivery method is 'delivery'
                if (fullPaymentIntent.metadata.deliveryMethod === 'delivery') {
                    if (!fullPaymentIntent.metadata.street || 
                        !fullPaymentIntent.metadata.city || 
                        !fullPaymentIntent.metadata.state || 
                        !fullPaymentIntent.metadata.zipCode) {
                        throw new Error('Shipping address is required for delivery orders');
                    }
                    
                    orderData.shippingAddress = {
                        street: fullPaymentIntent.metadata.street,
                        city: fullPaymentIntent.metadata.city,
                        state: fullPaymentIntent.metadata.state,
                        zipCode: fullPaymentIntent.metadata.zipCode,
                        country: fullPaymentIntent.metadata.country || 'US'
                    };
                }

                console.log('📝 Creating order with data:', JSON.stringify(orderData, null, 2));
                
                const order = await Order.create(orderData);
                console.log('✅ Order created:', order._id);

                // Handle points
                const user = await User.findById(fullPaymentIntent.metadata.userId);
                if (user) {
                    const pointsToAdd = Math.floor(fullPaymentIntent.amount / 100);
                    const pointsResult = await user.addPoints(pointsToAdd);
                    console.log('✨ Points updated:', pointsResult);
                }

                return NextResponse.json({ 
                    success: true,
                    orderId: order._id
                });

            } catch (err) {
                console.error('❌ Error processing payment:', err.message);
                console.error('Stack:', err.stack);
                return NextResponse.json({ error: err.message }, { status: 500 });
            }
        }

        // Acknowledge other events
        return NextResponse.json({ received: true });

    } catch (err) {
        console.error('❌ General webhook error:', err.message);
        console.error('Stack:', err.stack);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
