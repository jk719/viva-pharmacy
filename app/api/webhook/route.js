import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

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
            return new Response(`Webhook Error: ${err.message}`, { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        // Handle the event
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            console.log('Payment Intent data:', paymentIntent);
            
            try {
                // Get cart items from metadata
                const cartItems = paymentIntent.metadata.cartItems 
                    ? JSON.parse(paymentIntent.metadata.cartItems) 
                    : [];

                // Create order in database
                const order = await Order.create({
                    userId: paymentIntent.metadata.userId,
                    orderId: `ORDER-${Date.now()}`,
                    amount: paymentIntent.amount / 100,
                    status: 'pending',
                    total: paymentIntent.amount / 100,
                    items: cartItems,
                    orderData: {
                        items: cartItems,
                        total: paymentIntent.amount / 100,
                    },
                    createdAt: new Date(),
                });

                console.log('Order created successfully:', order);
            } catch (dbError) {
                console.error('Database error:', dbError);
                // Continue processing even if order creation fails
            }
        }

        return new Response(JSON.stringify({ received: true }), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: 'Webhook handler failed' }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
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
