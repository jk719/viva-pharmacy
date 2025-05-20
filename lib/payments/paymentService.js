// Central payment processing service that coordinates all payment-related operations
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { paymentTracker } from '@/lib/stripe/paymentTracker';
import Stripe from 'stripe';

// Only initialize Stripe on the server side with the secret key
const stripe = typeof window === 'undefined' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null; // Don't initialize on client

class PaymentService {
  constructor() {
    this.registeredHandlers = new Set();
    this.processedPayments = new Map();
  }

  // Single entry point for payment completed events from any source
  handlePaymentCompleted(data, source = 'unknown') {
    const paymentId = data.paymentIntentId || data.orderId;
    
    // Deduplicate payments using a unique ID
    if (this.processedPayments.has(paymentId)) {
      console.log(`🔄 Skipping duplicate payment processing for ${paymentId} from ${source}`);
      return false; // Return false if duplicate
    }
    
    console.log(`💰 Processing payment ${paymentId} from ${source}`);
    
    // Normalize data to ensure consistent field names
    const normalizedData = this.normalizePaymentData(data);
    
    // Mark as processed with timestamp
    this.processedPayments.set(paymentId, {
      timestamp: Date.now(),
      source,
      data: normalizedData
    });
    
    // Store in localStorage (client-side only)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('viva_payment_completed', JSON.stringify({
          timestamp: Date.now(),
          data: normalizedData
        }));
      } catch (err) {
        console.error('Error storing payment data in localStorage:', err);
      }
    }
    
    // The eventEmitter.emit call for PAYMENT_COMPLETED has been removed from here.
    // It's now the responsibility of the calling context in eventEmitter.js
    // to emit the event after this function successfully processes the data.
    
    return normalizedData; // Return the processed data, or false if it was a duplicate
  }
  
  // Clean up old processed payments to prevent memory leaks
  cleanup(maxAgeMs = 30 * 60 * 1000) { // Default: 30 minutes
    const cutoff = Date.now() - maxAgeMs;
    
    for (const [id, entry] of this.processedPayments.entries()) {
      if (entry.timestamp < cutoff) {
        this.processedPayments.delete(id);
      }
    }
  }
  
  // Ensure consistent field names across payment data
  normalizePaymentData(data) {
    return {
      // Core payment fields
      paymentIntentId: data.paymentIntentId || data.payment_intent_id || null,
      orderId: data.orderId || data.order_id || null,
      userId: data.userId || data.user_id || null,
      
      // Amount fields with consistent naming
      amount: data.amount || data.total || 0,
      total: data.total || data.amount || 0,
      
      // Loyalty information
      vivaBucksEarned: data.vivaBucksEarned || data.pointsEarned || data.loyaltyPointsEarned || Math.floor(data.amount || data.total || 0),
      
      // Order details
      items: data.items || [],
      deliveryMethod: data.deliveryMethod || 'pickup',
      selectedTime: data.selectedTime || null,
      
      // Metadata
      source: data.source || 'payment',
      status: data.status || 'completed',
      
      // Original data for reference
      originalData: data
    };
  }
  
  // Get stored payment data
  getStoredPaymentData() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const storedData = localStorage.getItem('viva_payment_completed');
      if (!storedData) return null;
      
      const parsedData = JSON.parse(storedData);
      
      // Validate data is recent (within last 5 minutes)
      const isRecent = Date.now() - parsedData.timestamp < 5 * 60 * 1000;
      if (!isRecent) return null;
      
      return parsedData.data;
    } catch (err) {
      console.error('Error retrieving payment data from localStorage:', err);
      return null;
    }
  }
  
  // Clear stored payment data
  clearStoredPaymentData() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('viva_payment_completed');
      } catch (err) {
        console.error('Error clearing payment data from localStorage:', err);
      }
    }
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
      if (!amount || !userId || !items) {
        throw new Error('Missing required fields for order payment');
      }
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);
      
      // Prepare metadata with all needed information
      const metadata = {
        userId,
        cartItems: JSON.stringify(items),
        deliveryMethod: deliveryMethod || 'pickup',
        selectedTime: selectedTime || null,
        ...additionalMetadata
      };
      
      // Add shipping address if provided
      if (shippingAddress) {
        metadata.shippingAddress = JSON.stringify({
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || 'US'
        });
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata
      });
      
      // Register with payment tracker
      paymentTracker.startPayment(paymentIntent.id, userId, amount);
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents
      };
    } catch (error) {
      console.error('Error creating order payment:', error);
      throw error;
    }
  }

  // Process a refund for an order
  async processRefund(refundData) {
    try {
      const { 
        paymentIntentId, 
        amount, 
        reason = 'requested_by_customer', 
        metadata = {} 
      } = refundData;
      
      // Validate required fields
      if (!paymentIntentId || !amount) {
        throw new Error('Missing required fields for refund');
      }
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);
      
      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amountInCents,
        reason,
        metadata
      });
      
      // Emit refund event
      eventEmitter.emit(Events.ORDER_REFUNDED, {
        paymentIntentId,
        refundId: refund.id,
        amount,
        reason,
        timestamp: new Date().toISOString()
      });
      
      return {
        refundId: refund.id,
        status: refund.status,
        amount: amount
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
}

// Singleton instance
export const paymentService = new PaymentService();

// Automatically hook up to payment tracker events
paymentTracker.onPaymentCompleted = (data) => {
  paymentService.handlePaymentCompleted(data, 'paymentTracker');
};

// Periodically clean up old payments (every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    paymentService.cleanup();
  }, 10 * 60 * 1000);
}

// Update payment success handler to correctly emit events with new naming convention
export const handlePaymentSuccess = async (rawHookData) => {
  try {
    console.log('🎉 Payment success handler triggered with data:', rawHookData);
    
    // Extract necessary identifiers from the raw hook data
    const { paymentIntentId, customerId, metadata = {}, amount } = rawHookData;
    
    if (!paymentIntentId) {
      console.error('❌ Missing payment intent ID in success handler');
      return { success: false, error: 'Missing payment intent ID' };
    }
    
    const userId = metadata.userId || customerId;
    
    if (!userId) {
      console.error('❌ Missing user ID in payment success handler');
      return { success: false, error: 'User ID not found in payment data' };
    }

    // Construct the initial payload for handlePaymentCompleted
    // Note: vivaBucksEarned will be calculated/normalized within paymentService.normalizePaymentData
    // if not already present in metadata or rawHookData.
    const initialEventPayload = {
      paymentIntentId,
      userId,
      amount: amount, // amount from webhook is typically in smallest currency unit (cents)
      metadata,
      // Let normalizePaymentData in paymentService handle vivaBucksEarned, total, etc.
      // Pass rawHookData as originalData if needed by normalizePaymentData
      originalData: rawHookData 
    };

    // Call paymentService.handlePaymentCompleted to deduplicate and normalize
    // 'paymentService' is the singleton instance of PaymentService class
    const processedData = paymentService.handlePaymentCompleted(initialEventPayload, 'handlePaymentSuccess_direct');

    if (processedData) {
      // If not a duplicate and successfully processed by paymentService
      console.log(`✅ Payment ${paymentIntentId} processed by paymentService. Emitting event.`);
      
      // Emit the PAYMENT_COMPLETED event with the processed (normalized and deduplicated) data.
      // processedData already contains normalized fields, including vivaBucksEarned.
      eventEmitter.emit(Events.PAYMENT_COMPLETED, processedData);
      
      // Create transaction record in database if needed, using vivaBucksEarned from processedData
      if (processedData.vivaBucksEarned && processedData.vivaBucksEarned > 0) {
        try {
          const response = await fetch('/api/loyalty/add-vivabucks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: processedData.userId,
              vivaBucks: processedData.vivaBucksEarned,
              source: 'purchase',
              sourceId: processedData.paymentIntentId,
              metadata: {
                amount: processedData.amount, // Use normalized amount
                paymentIntentId: processedData.paymentIntentId
              }
            })
          });
          
          if (!response.ok) {
            console.error('❌ Failed to add VivaBucks to user account:', await response.text());
          } else {
            console.log('✅ Successfully added VivaBucks to user account for', processedData.userId);
          }
        } catch (error) {
          console.error('❌ Error adding VivaBucks:', error);
        }
      }
      
      return { 
        success: true, 
        paymentIntentId: processedData.paymentIntentId,
        userId: processedData.userId,
        vivaBucksEarned: processedData.vivaBucksEarned,
        processedData // Optionally return all processed data
      };
    } else {
      // Payment was a duplicate or failed processing in handlePaymentCompleted
      console.log(`ℹ️ Payment success handler: Payment ${paymentIntentId} was a duplicate or not processed by paymentService.`);
      return { success: false, error: 'Duplicate or rejected payment by paymentService' };
    }
  } catch (error) {
    console.error('❌ Error in payment success handler:', error);
    return { success: false, error: error.message };
  }
}; 