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

    const { cartItems, shippingAddress, deliveryMethod, selectedTime } = await req.json();
    
    // Validate required fields for delivery orders
    if (deliveryMethod === 'delivery') {
      if (!shippingAddress?.street || !shippingAddress?.city || 
          !shippingAddress?.state || !shippingAddress?.zipCode) {
        return NextResponse.json(
          { error: 'Shipping address is required for delivery orders' }, 
          { status: 400 }
        );
      }
    }

    if (!selectedTime) {
      return NextResponse.json(
        { error: 'Selected time is required' },
        { status: 400 }
      );
    }
    
    // Debug log incoming data
    console.log('Received checkout data:', {
      userId: session.user.id,
      cartItemsCount: cartItems?.length,
      shippingAddress,
      deliveryMethod,
      selectedTime
    });
    
    // Format cart items for metadata
    const simplifiedItems = cartItems.map(item => ({
      id: item.id || item._id,
      name: item.name,
      qty: item.quantity,
      price: item.price
    }));

    // Prepare metadata
    const metadata = {
      userId: session.user.id,
      cartItemIds: JSON.stringify(simplifiedItems),
      deliveryMethod: deliveryMethod || 'pickup', // Default to pickup if not specified
      selectedTime: selectedTime,
      ...(deliveryMethod === 'delivery' ? {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'US'
      } : {})
    };

    console.log('Creating payment intent with metadata:', metadata);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(calculateTotal(cartItems) * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata: metadata
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

function calculateTotal(items) {
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity);
    return sum + (price * quantity);
  }, 0);
  
  console.log('Calculated total:', total);
  return total;
}
