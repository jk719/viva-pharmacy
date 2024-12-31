import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const data = await request.json();
    const { cartItems, metadata, amount, deliveryMethod, selectedTime } = data;

    // Create a compact version of cart items
    const compactCartItems = cartItems.map(item => ({
      id: item.id || item._id,
      name: item.name,
      qty: item.quantity,
      price: item.price.toString()
    }));

    // Combine metadata with cart items
    const enhancedMetadata = {
      ...metadata,
      cartItemIds: JSON.stringify(compactCartItems),
      deliveryMethod,
      selectedTime,
      userId: metadata.userId || 'guest'
    };

    console.log('Creating payment intent with metadata:', {
      cartItemsCount: compactCartItems.length,
      metadataSize: JSON.stringify(enhancedMetadata).length
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: enhancedMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
