import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cartItems, shippingAddress } = await req.json();
    
    // Ensure we have the userId from the session
    const userId = session.user.id;
    
    // Format cart items for metadata
    const simplifiedItems = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      qty: item.quantity,
      price: item.price
    }));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(calculateTotal(cartItems) * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata: {
        userId: userId, // Add userId to metadata
        cartItemIds: JSON.stringify(simplifiedItems),
        street: shippingAddress?.street || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.zipCode || '',
        country: shippingAddress?.country || 'US'
      }
    });

    console.log('Created payment intent with metadata:', paymentIntent.metadata); // Debug log

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
