import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const data = await request.json();
    const { cartItems, metadata, amount, deliveryMethod, selectedTime, shippingAddress } = data;

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

    // Add more detailed logging for cart items
    console.log('🛒 Cart Items:', cartItems.map(item => ({
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      image: item.image ? 'present' : 'missing'
    })));

    // Create payment intent first
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Format shipping address based on delivery method
    const formattedShippingAddress = deliveryMethod === 'delivery' ? {
      street: shippingAddress.street || shippingAddress.addressLine1,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: 'US'
    } : {
      street: 'Pickup',
      city: 'Pickup',
      state: 'Pickup',
      zipCode: 'Pickup',
      country: 'US'
    };

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order with payment intent ID
    await dbConnect();
    const order = await Order.create({
      userId: session?.user?.id || 'guest',
      items: cartItems.map(item => ({
        productId: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image?.startsWith('http') 
          ? item.image 
          : item.image 
            ? `${process.env.NEXT_PUBLIC_BASE_URL}${item.image}`
            : null
      })),
      total: amount,
      subtotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      tax: amount - cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      status: 'Pending',
      paymentStatus: 'Pending',
      deliveryMethod,
      selectedTime,
      shippingAddress: formattedShippingAddress,
      paymentIntentId: paymentIntent.id,
      orderNumber,
    });

    // Update payment intent with order details
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        orderId: order._id.toString(),
        userId: session?.user?.id || 'guest',
        orderNumber,
        deliveryMethod,
        selectedTime: selectedTime || '',
      }
    });

    // Calculate rewards
    const vivaBucksEarned = Math.floor(amount * 0.05);
    const rewardPointsEarned = Math.floor(amount);

    // Send order confirmation email only if user is authenticated
    if (session?.user?.email) {
      try {
        console.log('📧 Preparing order confirmation email...');
        
        const emailData = {
          orderNumber,
          email: session.user.email,
          items: order.items.map(item => ({
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image,
            subtotal: Number(item.price * item.quantity)
          })),
          subtotal: Number(order.subtotal),
          tax: Number(order.tax),
          total: Number(order.total),
          shippingAddress: formattedShippingAddress,
          deliveryMethod: order.deliveryMethod,
          selectedTime: order.selectedTime,
          vivaBucksEarned,
          rewardPointsEarned,
          customerName: session.user.name || 'Valued Customer'
        };

        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/confirmations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: request.headers.get('cookie') // Pass session cookie
          },
          credentials: 'include',
          body: JSON.stringify(emailData)
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error('❌ Email confirmation failed:', errorData);
        } else {
          console.log('✅ Order confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', {
          error: emailError.message,
          stack: process.env.NODE_ENV === 'development' ? emailError.stack : undefined
        });
      }
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: order._id.toString(),
      orderNumber
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
