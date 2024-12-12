import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_SIGNING_SECRET;

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const sig = headers().get('stripe-signature');

        let event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: err.message }, { status: 400 });
        }

        console.log('✅ Webhook received:', event.type);

        // ONLY handle payment_intent.succeeded
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            
            console.log('💳 Processing payment:', {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                metadata: paymentIntent.metadata
            });

            const amountInDollars = paymentIntent.amount / 100;
            const pointsToAdd = Math.floor(amountInDollars);
            const customerId = paymentIntent.metadata.userId;

            if (!customerId) {
                console.error('❌ No customer ID in metadata');
                return NextResponse.json({ error: 'No customer ID' }, { status: 400 });
            }

            try {
                await dbConnect();
                const user = await User.findById(customerId);
                
                if (!user) {
                    console.error('❌ User not found:', customerId);
                    return NextResponse.json({ error: 'User not found' }, { status: 404 });
                }

                const result = await user.addPoints(pointsToAdd);
                
                console.log('🎯 Points updated:', {
                    paymentId: paymentIntent.id,
                    userId: customerId,
                    basePoints: pointsToAdd,
                    adjustedPoints: result.adjustedPoints,
                    previousTotal: user.rewardPoints,
                    newTotal: result.rewardPoints,
                    tier: result.currentTier
                });

                return NextResponse.json({ 
                    success: true, 
                    result,
                    message: `Added ${result.adjustedPoints} points (${pointsToAdd} base points)`
                });
            } catch (err) {
                console.error('❌ Error updating points:', err);
                return NextResponse.json({ error: err.message }, { status: 500 });
            }
        } else {
            // For all other events, just acknowledge
            return NextResponse.json({ received: true });
        }
    } catch (err) {
        console.error('❌ Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
