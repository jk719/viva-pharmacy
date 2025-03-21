import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sendDeliveryConfirmation } from '@/lib/email/sendEmail';
import dbConnect from '@/lib/dbConnect';
import PrescriptionDelivery from '@/models/PrescriptionDelivery';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Only process prescription delivery payments
      if (paymentIntent.metadata.type === 'prescription_delivery') {
        await handlePrescriptionDelivery(paymentIntent);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePrescriptionDelivery(paymentIntent) {
  await dbConnect();
  const { metadata } = paymentIntent;
  const address = JSON.parse(metadata.address);
  const contact = JSON.parse(metadata.contact);

  try {
    // Calculate estimated delivery time
    const estimatedDelivery = calculateEstimatedDelivery(metadata.deliverySpeed);

    // Create delivery record
    const delivery = await PrescriptionDelivery.create({
      paymentIntentId: paymentIntent.id,
      userId: metadata.userId !== 'guest' ? metadata.userId : null,
      status: 'PENDING',
      deliverySpeed: metadata.deliverySpeed,
      amount: paymentIntent.amount,
      address: {
        street: address.street,
        apartment: address.apartment || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      contact: {
        name: contact.name,
        phone: contact.phone
      },
      estimatedDelivery
    });

    // Send confirmation email
    await sendDeliveryConfirmation({
      to: paymentIntent.receipt_email || contact.email,
      deliveryDetails: {
        id: delivery._id,
        estimatedDelivery,
        address,
        contact,
        amount: paymentIntent.amount / 100,
        deliverySpeed: metadata.deliverySpeed
      }
    });

    // Update delivery status
    await delivery.updateOne({ status: 'CONFIRMED' });

  } catch (error) {
    console.error('Error handling prescription delivery:', error);
    throw error;
  }
}

function calculateEstimatedDelivery(deliverySpeed) {
  const now = new Date();
  
  switch (deliverySpeed) {
    case 'ONE_HOUR':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'SAME_DAY':
      // Set to 6 PM today
      const sameDay = new Date(now);
      sameDay.setHours(18, 0, 0, 0);
      return sameDay;
    case 'NEXT_DAY':
      // Set to 6 PM tomorrow
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(18, 0, 0, 0);
      return nextDay;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
} 