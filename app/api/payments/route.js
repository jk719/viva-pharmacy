import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import crypto from 'crypto';
import User from '@/models/User';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Add at the top of the file
const PAYMENT_INTENT_CACHE = new Map();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Add this helper function at the top
const createCompactCartMetadata = (cartItems) => {
    return JSON.stringify(cartItems.map(item => ({
        id: item.id || item._id,
        name: item.name,
        p: parseFloat(item.price),
        q: parseInt(item.quantity) || 1
    })));
};

// Add this function after imports
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of PAYMENT_INTENT_CACHE.entries()) {
    if (now - value.timestamp > CACHE_TIMEOUT) {
      PAYMENT_INTENT_CACHE.delete(key);
    }
  }
};

async function getOrCreateStripeCustomer(userId, email) {
    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // If user already has a Stripe customer ID, return it
        if (user.stripeCustomerId) {
            return user.stripeCustomerId;
        }

        // Ensure user has a name
        const customerName = user.name || `${user.firstName} ${user.lastName}` || email.split('@')[0];
        
        // Update user's name if not set
        if (!user.name) {
            user.name = customerName;
            await user.save();
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
            email: email,
            name: customerName,
            metadata: {
                userId: userId
            }
        });

        // Save Stripe customer ID to user
        user.stripeCustomerId = customer.id;
        await user.save();

        return customer.id;
    } catch (error) {
        console.error('Error in getOrCreateStripeCustomer:', error);
        throw error;
    }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, prescriptionId, deliveryOption } = await req.json();

    // Convert amount to cents and ensure it's a clean integer
    const amountInCents = Math.round(amount * 100);

    // Add validation for amount
    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // If this is a prescription order, verify it's been approved
    if (prescriptionId) {
      const prescription = await Order.findOne({
        _id: prescriptionId,
        userId: session.user.id,
        isPrescriptionOrder: true
      });

      if (!prescription || prescription.prescriptionDetails.verificationStatus !== 'Verified') {
        return NextResponse.json(
          { success: false, message: 'Prescription not verified' },
          { status: 400 }
        );
      }
    }

    // Create Stripe payment intent with the properly formatted amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Use the rounded integer amount
      currency: 'usd',
      metadata: {
        userId: session.user.id,
        prescriptionId: prescriptionId || null,
        deliveryOption
      }
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create payment',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
