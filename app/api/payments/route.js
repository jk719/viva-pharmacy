import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const data = await request.json();
    const { cartItems, amount, deliveryMethod, selectedTime, shippingAddress } = data;

    console.log('📦 Payment request received:', {
      user: session?.user?.email ? `${session.user.email.split('@')[0]}@...` : 'guest',
      deliveryMethod,
      selectedTime,
      shippingAddress: shippingAddress ? 'present' : 'missing',
      cartItems: cartItems.length,
      amount: amount
    });

    // Validate shipping address for delivery method
    if (deliveryMethod === 'delivery' && (!shippingAddress || !shippingAddress.street)) {
      return NextResponse.json(
        { error: 'Shipping address is required for delivery' },
        { status: 400 }
      );
    }

    // Create payment intent with all necessary metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: session?.user?.id || 'guest',
        userEmail: session?.user?.email || '',
        cartItems: JSON.stringify(cartItems.map(item => ({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1
        }))),
        deliveryMethod,
        selectedTime: selectedTime || '',
        shippingAddress: JSON.stringify(shippingAddress || {}),
        amount: amount.toString()
      }
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error) {
    console.error('❌ Payment API error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
