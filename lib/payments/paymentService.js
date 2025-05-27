// Central payment processing service that coordinates all payment-related operations
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { paymentTracker } from '@/lib/stripe/paymentTracker';
import { paymentStorage } from '@/utils/paymentStorage';
import { normalizePaymentData } from '@/utils/dataNormalization';
import { processPaymentEvent } from '@/utils/eventDeduplication';
import Stripe from 'stripe';

// Only initialize Stripe on the server side with the secret key
const stripe = typeof window === 'undefined' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null; // Don't initialize on client

class PaymentService {
  constructor() {
    this.registeredHandlers = new Set();
  }

  // Single entry point for payment completed events from any source
  handlePaymentCompleted(data, source = 'unknown') {
    console.log(`💰 Processing payment from ${source}:`, data);
    
    // Use centralized event deduplication and processing
    const wasProcessed = processPaymentEvent(data, (normalizedData) => {
      console.log(`✅ Payment processed successfully:`, normalizedData);
      
      // Store in centralized storage
      paymentStorage.store(normalizedData);
      
      // Emit the processed event
      eventEmitter.emit(Events.PAYMENT_COMPLETED, normalizedData);
      
      return normalizedData;
    }, { source });
    
    return wasProcessed;
  }
  
  // Clean up old processed payments to prevent memory leaks
  cleanup(maxAgeMs = 30 * 60 * 1000) { // Default: 30 minutes
    // The cleanup is now handled by the eventDeduplication utility
    console.log('PaymentService cleanup called - handled by eventDeduplication utility');
  }
  
  // Get stored payment data using centralized utility
  getStoredPaymentData() {
    return paymentStorage.retrieve();
  }
  
  // Clear stored payment data using centralized utility
  clearStoredPaymentData() {
    return paymentStorage.clear();
  }

  // Get Stripe client for advanced operations
  // This is provided for operations not yet abstracted in the payment service
  getStripeClient() {
    if (typeof window !== 'undefined') {
      console.warn('Attempting to access Stripe server client from browser - this is not allowed');
      return null;
    }
    return stripe;
  }

  // Create a payment intent for prescription delivery
  async createPrescriptionDeliveryPayment(deliveryData) {
    try {
      const { deliverySpeed, address, contact, userId } = deliveryData;
      
      // Calculate amount based on delivery speed
      const DELIVERY_FEES = {
        NEXT_DAY: 0,
        SAME_DAY: 500, // $5.00 in cents
        ONE_HOUR: 700  // $7.00 in cents
      };
      
      const amount = DELIVERY_FEES[deliverySpeed];
      
      if (amount === undefined) {
        throw new Error(`Invalid delivery speed: ${deliverySpeed}`);
      }
      
      // Create payment intent
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
          userId: userId || 'guest'
        }
      });
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount
      };
    } catch (error) {
      console.error('Error creating prescription delivery payment:', error);
      throw error;
    }
  }

  // Create a payment intent for regular order
  async createOrderPayment(orderData) {
    try {
      const { 
        amount, 
        userId, 
        items, 
        deliveryMethod, 
        selectedTime, 
        shippingAddress,
        additionalMetadata = {} 
      } = orderData;
      
      // Validate required fields
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided for payment');
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          type: 'order',
          userId: userId || 'guest',
          itemCount: items.length,
          deliveryMethod: deliveryMethod || 'pickup',
          selectedTime: selectedTime || '',
          ...additionalMetadata
        }
      });
      
      // Track payment start
      paymentTracker.startPayment(paymentIntent.id, userId, amount);
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: Math.round(amount * 100)
      };
    } catch (error) {
      console.error('Error creating order payment:', error);
      throw error;
    }
  }

  // Process a refund
  async processRefund(refundData) {
    try {
      const { paymentIntentId, amount, reason = 'requested_by_customer' } = refundData;
      
      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is required for refund');
      }
      
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
        reason
      });
      
      console.log('Refund processed:', refund);
      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Register payment completion callback
  registerPaymentHandler(handler) {
    this.registeredHandlers.add(handler);
  }

  // Unregister payment completion callback
  unregisterPaymentHandler(handler) {
    this.registeredHandlers.delete(handler);
  }
}

// Create singleton instance
export const paymentService = new PaymentService();

// Webhook handler for Stripe events
export const handlePaymentSuccess = async (rawHookData) => {
  try {
    console.log('🎯 Webhook payment success handler called');
    
    // Normalize the webhook data
    const normalizedData = normalizePaymentData(rawHookData);
    
    // Process through the payment service
    const result = paymentService.handlePaymentCompleted(normalizedData, 'webhook');
    
    return result;
  } catch (error) {
    console.error('Error in webhook payment handler:', error);
    throw error;
  }
};

export default paymentService; 