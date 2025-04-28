/**
 * Checkout Service
 * A centralized service for managing checkout-related functionality
 * including payment processing, order creation, and loyalty points.
 */

import eventEmitter, { Events } from '@/lib/eventEmitter';
import { trackPurchase } from '@/lib/analytics/events';

class CheckoutService {
  /**
   * Process a successful payment by storing data and emitting events
   * @param {Object} paymentData - Payment data from Stripe
   * @param {Object} orderDetails - Order details including items and amounts
   */
  processSuccessfulPayment(paymentData, orderDetails) {
    try {
      // Create a single source of truth for order data
      const completedOrder = {
        orderId: paymentData.id,
        items: orderDetails.items || [],
        total: orderDetails.total,
        tax: orderDetails.tax || 0,
        shipping: orderDetails.shipping || 0,
        deliveryMethod: orderDetails.deliveryMethod || 'pickup',
        selectedTime: orderDetails.selectedTime || '',
        pointsEstimate: Math.floor(orderDetails.subtotal * 10), // Simple estimate for display
        timestamp: Date.now(),
        paymentProcessed: true
      };
      
      // Store in sessionStorage as single source of truth
      sessionStorage.setItem('orderSuccessData', JSON.stringify(completedOrder));
      
      // Track analytics
      trackPurchase(
        paymentData.id,
        orderDetails.items,
        orderDetails.total,
        orderDetails.shipping || 0,
        orderDetails.tax || 0
      );
      
      // Emit a single event for payment completion
      eventEmitter.emit(Events.ORDER_COMPLETED, {
        orderId: paymentData.id,
        amount: orderDetails.total,
        timestamp: Date.now()
      });
      
      console.log('✅ Checkout service processed payment successfully');
      return completedOrder;
    } catch (error) {
      console.error('Error in checkout service:', error);
      throw error;
    }
  }
  
  /**
   * Get stored order data from session storage
   * @returns {Object|null} The stored order data or null if not found
   */
  getStoredOrderData() {
    try {
      const storedData = sessionStorage.getItem('orderSuccessData');
      if (!storedData) return null;
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error getting stored order data:', error);
      return null;
    }
  }
  
  /**
   * Create redirect URL for checkout success page
   * @param {string} orderId - Order ID
   * @returns {string} The redirect URL
   */
  createSuccessRedirectUrl(orderId) {
    try {
      const params = new URLSearchParams({
        orderId: orderId,
        ts: Date.now() // Timestamp to prevent caching
      });
      return `/checkout/success?${params.toString()}`;
    } catch (error) {
      console.error('Error creating redirect URL:', error);
      // Fallback to simplest possible URL
      return `/checkout/success?orderId=${orderId}`;
    }
  }
  
  /**
   * Clear cart and checkout data
   */
  clearCheckoutData() {
    try {
      // Only clear payment-specific data, not the completed order
      sessionStorage.removeItem('paymentIntent');
      sessionStorage.removeItem('checkoutItems');
      sessionStorage.removeItem('checkoutTimingLogs');
    } catch (error) {
      console.error('Error clearing checkout data:', error);
    }
  }
}

// Create singleton instance
const checkoutService = new CheckoutService();
export default checkoutService;
