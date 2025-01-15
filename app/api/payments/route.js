import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        // Get session
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const {
            cartItems,
            deliveryMethod,
            selectedTime,
            shippingAddress,
            amount
        } = await request.json();

        // Validate required fields
        if (!cartItems?.length || !deliveryMethod || !selectedTime || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert amount to cents for Stripe
        const amountInCents = Math.round(parseFloat(amount) * 100);

        // Create a unique idempotency key using timestamp and random string
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const idempotencyKey = `payment_${session.user.id}_${timestamp}_${randomString}`;

        console.log('📦 Payment request received:', {
            user: `${session.user.email.substring(0, 8)}...`,
            deliveryMethod,
            selectedTime,
            shippingAddress: shippingAddress || 'missing',
            cartItems: cartItems.length,
            amountInDollars: amount,
            amountInCents
        });

        try {
            // Create payment intent with metadata
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    userId: session.user.id,
                    userEmail: session.user.email,
                    cartItems: JSON.stringify(cartItems.map(item => ({
                        id: item.id || item._id,
                        name: item.name,
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity) || 1,
                        image: item.image
                    }))),
                    deliveryMethod,
                    selectedTime,
                    shippingAddress: JSON.stringify(shippingAddress || {}),
                    amountInDollars: amount.toString(),
                    amountInCents: amountInCents.toString()
                }
            }, {
                idempotencyKey
            });

            console.log('✅ Payment intent created:', {
                id: paymentIntent.id,
                amountInCents,
                idempotencyKey: `${idempotencyKey.substring(0, 20)}...`
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret
            });

        } catch (stripeError) {
            console.error('❌ Stripe API error:', {
                message: stripeError.message,
                stack: stripeError.stack
            });

            // Check if it's an idempotency error
            if (stripeError.code === 'idempotency_key_in_use') {
                // Generate a new key and retry
                const newIdempotencyKey = `payment_${session.user.id}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
                
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents,
                    currency: 'usd',
                    automatic_payment_methods: {
                        enabled: true,
                    },
                    metadata: {
                        userId: session.user.id,
                        userEmail: session.user.email,
                        cartItems: JSON.stringify(cartItems.map(item => ({
                            id: item.id || item._id,
                            name: item.name,
                            price: parseFloat(item.price),
                            quantity: parseInt(item.quantity) || 1,
                            image: item.image
                        }))),
                        deliveryMethod,
                        selectedTime,
                        shippingAddress: JSON.stringify(shippingAddress || {}),
                        amountInDollars: amount.toString(),
                        amountInCents: amountInCents.toString()
                    }
                }, {
                    idempotencyKey: newIdempotencyKey
                });

                return NextResponse.json({
                    clientSecret: paymentIntent.client_secret
                });
            }

            return NextResponse.json(
                { error: stripeError.message },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('❌ Payment API error:', {
            message: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
