import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    console.log('Webhook received:', req.url);
    
    try {
        await dbConnect();
        
        const body = await req.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');

        console.log('Stripe signature:', sig);
        console.log('Endpoint secret:', endpointSecret ? 'Present' : 'Missing');

        let event;

        try {
            event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
            console.log('Event constructed successfully:', event.type);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        // Handle the event
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            
            try {
                const userId = paymentIntent.metadata.userId;
                if (!userId) {
                    console.error('No userId found in payment metadata');
                    return NextResponse.json(
                        { error: 'No userId in metadata' }, 
                        { status: 400 }
                    );
                }

                // Parse cart items from metadata
                const cartItems = JSON.parse(paymentIntent.metadata.cartItemIds || '[]');
                
                // Format items according to the Order schema
                const formattedItems = cartItems.map(item => ({
                    productId: item.id.toString(),
                    name: item.name,
                    quantity: item.qty,
                    price: item.price
                }));

                // Create order with schema-matching structure
                const order = await Order.create({
                    userId: userId,
                    items: formattedItems,
                    total: paymentIntent.amount / 100,
                    status: 'pending',
                    shippingAddress: {
                        // Get from payment metadata or use placeholder
                        street: paymentIntent.metadata.street || '',
                        city: paymentIntent.metadata.city || '',
                        state: paymentIntent.metadata.state || '',
                        zipCode: paymentIntent.metadata.zipCode || '',
                        country: paymentIntent.metadata.country || 'US'
                    }
                });

                console.log('Order created successfully:', order);

                const calculateVivaBucks = (amount) => {
                    // For example: $1 = 0.01 VivaBucks
                    return amount * 0.01;
                };

                // Calculate and update VivaBucks
                const vivaBucksEarned = calculateVivaBucks(paymentIntent.amount);
                await User.findByIdAndUpdate(userId, {
                    $inc: { vivaBucks: vivaBucksEarned }
                });

                return NextResponse.json({ success: true });
            } catch (dbError) {
                console.error('Database error:', dbError);
                return NextResponse.json(
                    { error: 'Database operation failed' },
                    { status: 500 }
                );
            }
        }

        // Return success for other event types
        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}
