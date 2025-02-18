import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import crypto from 'crypto';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Add this helper function at the top
const createCompactCartMetadata = (cartItems) => {
    return JSON.stringify(cartItems.map(item => ({
        id: item.id || item._id,
        name: item.name,
        p: parseFloat(item.price),
        q: parseInt(item.quantity) || 1
    })));
};

async function getOrCreateStripeCustomer(userId, email) {
    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // If user already has a Stripe customer ID, return it
        if (user.stripeCustomerId) {
            return user.stripeCustomerId;
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
            email: email,
            metadata: {
                userId: userId
            }
        });

        // Save Stripe customer ID to user
        user.stripeCustomerId = customer.id;
        await user.save();

        return customer.id;
    } catch (error) {
        console.error('Error in getOrCreateStripeCustomer:', error);
        throw error;
    }
}

export async function POST(request) {
    console.log('💳 Payment endpoint hit');
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get request data
        const data = await request.json();
        const {
            cartItems,
            deliveryMethod,
            selectedTime,
            shippingAddress,
            amount,
            requestId // Make sure this is passed from the client
        } = data;

        // Validate required fields
        if (!cartItems?.length || !deliveryMethod || !selectedTime || !amount || !requestId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create deterministic idempotency key from request data
        const idempotencyKey = crypto
            .createHash('sha256')
            .update(`${session.user.id}-${requestId}-${amount}`)
            .digest('hex');

        const amountInCents = Math.round(parseFloat(amount) * 100);

        try {
            // Get or create Stripe customer
            const customerId = await getOrCreateStripeCustomer(
                session.user.id,
                session.user.email
            );

            // First check for existing intent
            const existingIntents = await stripe.paymentIntents.list({
                limit: 1,
                customer: customerId,
                created: {
                    gte: Math.floor(Date.now() / 1000) - 300
                }
            });

            const duplicateIntent = existingIntents.data.find(
                intent => intent.metadata.requestId === requestId
            );

            if (duplicateIntent) {
                console.log('⚠️ Returning existing payment intent:', duplicateIntent.id);
                return NextResponse.json({
                    clientSecret: duplicateIntent.client_secret
                });
            }

            // Create new payment intent with customer ID
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                customer: customerId,
                automatic_payment_methods: { enabled: true },
                metadata: {
                    userId: session.user.id,
                    userEmail: session.user.email,
                    cartItems: createCompactCartMetadata(cartItems),
                    deliveryMethod,
                    selectedTime,
                    shippingAddress: JSON.stringify(shippingAddress || {}),
                    amountInDollars: amount.toString(),
                    requestId
                }
            }, {
                idempotencyKey
            });

            console.log('✅ Payment intent created:', {
                id: paymentIntent.id,
                customerId,
                amountInCents
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret
            });

        } catch (stripeError) {
            console.error('❌ Stripe error:', stripeError);
            return NextResponse.json(
                { error: stripeError.message },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('❌ General error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
