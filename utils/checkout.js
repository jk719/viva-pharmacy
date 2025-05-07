export const trackBeginCheckout = (items, total) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: total,
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
    if (typeof window !== 'undefined' && window.firebase && window.firebase.analytics) {
      window.firebase.analytics().logEvent('begin_checkout', {
        currency: 'USD',
        value: total,
        items: items.length
      });
    }
  } catch (err) {
    console.error('Error tracking checkout event:', err);
  }
};

export const trackPurchase = (items, total) => {
  try {
    // Google Analytics - GA4 purchase event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: `order-${Date.now()}`,
        value: total,
        currency: 'USD',
        tax: 0,
        shipping: 0,
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
    
    // Firebase Analytics
    if (typeof window !== 'undefined' && window.firebase && window.firebase.analytics) {
      window.firebase.analytics().logEvent('purchase', {
        currency: 'USD',
        value: total,
        items: items.length,
        transaction_id: `order-${Date.now()}`
      });
    }
    
    console.log('Purchase event tracked successfully:', {
      itemCount: items.length,
      total: total
    });
  } catch (err) {
    console.error('Error tracking purchase event:', err);
  }
};

// Helper function to trigger local webhook for development
export const triggerLocalWebhook = async (paymentIntentId, userId, cartItems, shippingAddress = {}, deliveryMethod = 'delivery', selectedTime = null) => {
  // In client-side code, we check for localhost rather than environment variable
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isLocalhost) {
    // Only run in local development
    return null;
  }

  try {
    console.log('🧪 Local development detected: Triggering local webhook');
    
    // Create a mock Stripe event that mimics the payment_intent.succeeded event
    const mockEvent = {
      id: `evt_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntentId || `pi_${Date.now()}`,
          object: 'payment_intent',
          amount: Math.round(parseFloat(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)) * 100),
          amount_received: Math.round(parseFloat(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)) * 100),
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            userId: userId,
            cartItems: JSON.stringify(cartItems.map(item => ({
              id: item.productId || item.id || item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || item.imageUrl
            }))),
            shippingAddress: JSON.stringify(shippingAddress),
            deliveryMethod,
            selectedTime: selectedTime || new Date().toISOString()
          }
        }
      }
    };

    // Send the mock webhook event to our local webhook endpoint
    const response = await fetch('/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true' // Special header to bypass signature verification
      },
      body: JSON.stringify(mockEvent)
    });

    if (response.ok) {
      console.log('✅ Local webhook triggered successfully - order should now be created');
      
      // Try to get order details from response
      try {
        const responseData = await response.json();
        return {
          success: true,
          orderId: paymentIntentId,
          total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          deliveryMethod,
          selectedTime,
          items: cartItems,
          // Round up to nearest whole number for points
          pointsEarned: Math.ceil(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)),
          ...responseData
        };
      } catch (e) {
        // If can't parse JSON, just return basic success object
        return {
          success: true,
          orderId: paymentIntentId,
          total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          deliveryMethod,
          selectedTime,
          items: cartItems,
          // Round up to nearest whole number for points
          pointsEarned: Math.ceil(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))
        };
      }
    } else {
      const error = await response.text();
      console.error('❌ Local webhook failed:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('Error triggering local webhook:', error);
    return { success: false, error: error.message };
  }
}; 