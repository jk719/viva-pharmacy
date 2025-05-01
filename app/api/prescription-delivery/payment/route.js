import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { authOptions } from '@/lib/auth';
import PrescriptionDelivery from '@/models/PrescriptionDelivery';
import dbConnect from '@/lib/dbConnect';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DELIVERY_FEES = {
  NEXT_DAY: 0,
  SAME_DAY: 500, // $5.00 in cents
  ONE_HOUR: 700  // $7.00 in cents
};

export async function POST(request) {
  try {
    console.log('Prescription Delivery Payment: Starting request');
    
    // Get token from middleware (will be null/undefined if guest)
    const token = request.nextauth?.token;
    const body = await request.json();
    
    const { deliverySpeed, address, contact } = body;

    console.log('Request details:', {
      deliverySpeed,
      userId: token?.id || 'guest', // Use token.id or 'guest'
      address: { ...address, street: address?.street?.substring(0, 10) + '...' }, // Truncate for privacy
      contact: { ...contact, phone: '***-***-' + contact?.phone?.slice(-4) } // Mask phone number
    });

    // Validate required fields
    if (!deliverySpeed || !address || !contact) {
      console.log('Validation failed:', { deliverySpeed, hasAddress: !!address, hasContact: !!contact });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate address fields
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
    const missingAddressFields = requiredAddressFields.filter(field => !address[field]);
    if (missingAddressFields.length > 0) {
      console.log('Missing address fields:', missingAddressFields);
      return NextResponse.json(
        { error: `Missing required address fields: ${missingAddressFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate contact fields
    if (!contact.name || !contact.phone) {
      console.log('Missing contact fields:', { hasName: !!contact.name, hasPhone: !!contact.phone });
      return NextResponse.json(
        { error: 'Missing required contact information' },
        { status: 400 }
      );
    }

    // Calculate amount (delivery fee)
    const amount = DELIVERY_FEES[deliverySpeed];
    if (amount === undefined) {
      console.log('Invalid delivery speed:', deliverySpeed);
      return NextResponse.json(
        { error: 'Invalid delivery speed' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');

    // Calculate estimated delivery time
    const estimatedDelivery = calculateEstimatedDelivery(deliverySpeed);
    console.log('Estimated delivery:', estimatedDelivery);

    // Create payment intent
    console.log('Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'prescription_delivery',
        deliverySpeed,
        address: JSON.stringify(address),
        contact: JSON.stringify(contact),
        userId: token?.id || 'guest' // Use token.id or 'guest'
      }
    });
    console.log('Payment intent created:', paymentIntent.id);

    // Save to MongoDB
    console.log('Saving delivery record to MongoDB...');
    const deliveryRecord = await PrescriptionDelivery.create({
      paymentIntentId: paymentIntent.id,
      userId: token?.id || null, // Use token.id or null
      deliverySpeed,
      amount,
      address,
      contact,
      estimatedDelivery,
      status: 'PENDING'
    });
    console.log('Delivery record saved:', deliveryRecord._id);

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      deliveryId: deliveryRecord._id
    });
  } catch (error) {
    console.error('Payment intent creation error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Handle specific error types
    if (error.type === 'StripeError') {
      return NextResponse.json(
        { error: 'Payment processing error', details: error.message },
        { status: 402 }
      );
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

function calculateEstimatedDelivery(deliverySpeed) {
  const now = new Date();
  switch (deliverySpeed) {
    case 'ONE_HOUR':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'SAME_DAY':
      return new Date(now.setHours(23, 59, 59, 999));
    case 'NEXT_DAY':
      now.setDate(now.getDate() + 1);
      return new Date(now.setHours(23, 59, 59, 999));
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
} 