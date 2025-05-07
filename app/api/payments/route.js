import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import crypto from 'crypto';
import User from '@/models/User';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import Order from '@/models/Order';
import { getToken } from "next-auth/jwt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secret = process.env.NEXTAUTH_SECRET;

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
    // Use getToken ONCE to retrieve the token directly
    const token = await getToken({ req, secret });

    // Check for token and required properties (e.g., sub for user ID)
    if (!token || !token.sub) {
      console.error('Authentication failed: Token or token.sub missing in payments POST');
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    
    // Use userId derived from token.sub consistently
    const userId = token.sub; 

    const { 
      amount, 
      prescriptionId, 
      deliveryOption,
      cartItems,
      amountDetails,
      deliveryMethod,
      selectedTime,
      shippingAddress,
    } = await req.json();

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
        userId: userId, // Use userId variable consistently
        isPrescriptionOrder: true
      });

      if (!prescription || prescription.prescriptionDetails.verificationStatus !== 'Verified') {
        return NextResponse.json(
          { success: false, message: 'Prescription not verified' },
          { status: 400 }
        );
      }
    }

    // Prepare metadata - compact versions of the required data
    // This is needed because Stripe metadata has size limitations
    const metadata = {
      userId: userId,
      prescriptionId: prescriptionId || null,
      deliveryOption: deliveryOption || null,
      deliveryMethod: deliveryMethod || 'delivery',
      selectedTime: selectedTime || 'default',
    };

    // Add cart items to metadata if provided
    if (cartItems && cartItems.length > 0) {
      // Compress cart items to fit within Stripe metadata limits
      metadata.cartItems = createCompactCartMetadata(cartItems);
    }

    // Add shipping address to metadata if provided
    if (shippingAddress) {
      // Compact version of shipping address
      metadata.shippingAddress = JSON.stringify({
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode || '',
        country: shippingAddress.country || 'US'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: 'usd',
      metadata
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
