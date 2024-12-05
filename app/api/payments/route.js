import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { amount, cartItems } = await req.json();
        const session = await getServerSession(authOptions);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'always',
            },
            metadata: {
                userId: session.user.id,
                cartItems: JSON.stringify(cartItems)
            }
        });

        return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
    } catch (error) {
        console.error('Payment error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
