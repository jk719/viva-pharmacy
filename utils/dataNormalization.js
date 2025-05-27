/**
 * Centralized data normalization utility
 * Handles consistent field mapping across the application
 */

/**
 * Normalize payment data to ensure consistent field names
 * @param {Object} data - Raw payment data
 * @returns {Object} Normalized payment data
 */
export const normalizePaymentData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      paymentIntentId: null,
      orderId: null,
      userId: null,
      amount: 0,
      total: 0,
      loyaltyPointsEarned: 0,
      pointsEarned: 0,
      items: [],
      deliveryMethod: 'pickup',
      selectedTime: null,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  // Extract and normalize core fields
  const paymentIntentId = data.paymentIntentId || data.payment_intent_id || data.orderId || null;
  const orderId = data.orderId || data.order_id || paymentIntentId || null;
  const userId = data.userId || data.user_id || null;
  
  // Normalize amount fields
  const amount = parseFloat(data.amount || data.total || 0);
  const total = parseFloat(data.total || data.amount || 0);
  
  // Normalize loyalty points fields
  const loyaltyPointsEarned = parseInt(data.loyaltyPointsEarned || data.pointsEarned || data.vivaBucksEarned || Math.floor(amount) || 0);
  const pointsEarned = parseInt(data.pointsEarned || data.loyaltyPointsEarned || data.vivaBucksEarned || Math.floor(amount) || 0);

  return {
    // Core payment fields
    paymentIntentId,
    orderId,
    userId,
    
    // Amount fields (both names for compatibility)
    amount,
    total,
    
    // Loyalty fields (both names for compatibility)
    loyaltyPointsEarned,
    pointsEarned,
    vivaBucksEarned: loyaltyPointsEarned, // Legacy compatibility
    
    // Order details
    items: Array.isArray(data.items) ? data.items : [],
    deliveryMethod: data.deliveryMethod || 'pickup',
    selectedTime: data.selectedTime || null,
    
    // Metadata
    status: data.status || 'completed',
    source: data.source || 'payment',
    timestamp: data.timestamp || new Date().toISOString(),
    
    // Tier information if available
    tierUpgrade: data.tierUpgrade || false,
    newTier: data.newTier || null,
    
    // Original data for reference
    originalData: data
  };
};

/**
 * Normalize user data for consistency
 * @param {Object} data - Raw user data
 * @returns {Object} Normalized user data
 */
export const normalizeUserData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      id: null,
      email: null,
      name: null,
      phone: null
    };
  }

  return {
    id: data.id || data._id || data.userId || null,
    email: data.email || null,
    name: data.name || data.fullName || data.firstName || null,
    phone: data.phone || data.phoneNumber || null
  };
};

/**
 * Normalize loyalty data for consistency
 * @param {Object} data - Raw loyalty data
 * @returns {Object} Normalized loyalty data
 */
export const normalizeLoyaltyData = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      availableVivaBucks: 0,
      totalVivaBucksEarned: 0,
      currentTier: 'EXPLORER',
      pointsMultiplier: 1
    };
  }

  const availableVivaBucks = parseInt(data.availableVivaBucks || data.vivaBucks || data.points || 0);
  const totalVivaBucksEarned = parseInt(data.totalVivaBucksEarned || data.cumulativeVivaBucks || data.totalPoints || 0);

  return {
    availableVivaBucks,
    totalVivaBucksEarned,
    vivaBucks: availableVivaBucks, // Legacy compatibility
    cumulativeVivaBucks: totalVivaBucksEarned, // Legacy compatibility
    currentTier: data.currentTier || data.tier || 'EXPLORER',
    pointsMultiplier: parseFloat(data.pointsMultiplier || data.multiplier || 1),
    lastUpdated: data.lastUpdated || new Date().toISOString()
  };
};

/**
 * Check if we're on a checkout-related page
 * @returns {boolean} True if on checkout-related page
 */
export const isCheckoutRelatedPage = () => {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname;
  
  // Explicitly exclude certain pages
  if (path.includes('/giveaway')) return false;
  
  // Only include specific checkout-related paths
  return path.includes('/checkout') || 
         path.includes('/payment') || 
         path.includes('/order-confirmation') || 
         path.includes('/success');
}; 