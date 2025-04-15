import * as gtag from './gtag';

// Product Events
export const trackProductView = (product) => {
  gtag.ecommerce.viewItem(product);
};

// Cart Events
export const trackAddToCart = (product, quantity) => {
  gtag.ecommerce.addToCart(product, quantity);
};

export const trackRemoveFromCart = (product, quantity) => {
  gtag.event({
    action: 'remove_from_cart',
    category: 'ecommerce',
    label: product.name,
    value: product.price * quantity,
    item_data: {
      item_id: product._id,
      item_name: product.name,
      item_brand: product.brand || 'Unknown',
      item_category: product.category,
      item_variant: product.variant || 'Default',
      quantity: quantity,
      price: product.price,
      currency: 'USD'
    }
  });
};

export const trackCartView = (items, total) => {
  gtag.event({
    action: 'view_cart',
    category: 'ecommerce',
    value: total,
    item_data: items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      item_brand: item.brand || 'Unknown',
      item_category: item.category,
      quantity: item.quantity,
      price: item.price,
      currency: 'USD'
    }))
  });
};

export const trackUpdateCartQuantity = (product, oldQuantity, newQuantity) => {
  gtag.event({
    action: 'update_cart_quantity',
    category: 'ecommerce',
    label: product.name,
    value: product.price * (newQuantity - oldQuantity),
    item_data: {
      item_id: product._id,
      item_name: product.name,
      item_brand: product.brand || 'Unknown',
      item_category: product.category,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      price: product.price,
      currency: 'USD'
    }
  });
};

export const trackCartAbandonment = (items, total) => {
  gtag.event({
    action: 'cart_abandonment',
    category: 'ecommerce',
    value: total,
    item_data: items.map(item => ({
      item_id: item.productId,
      item_name: item.name,
      item_brand: item.brand || 'Unknown',
      item_category: item.category,
      quantity: item.quantity,
      price: item.price,
      currency: 'USD'
    }))
  });
};

// Checkout Events
export const trackBeginCheckout = (items, total) => {
  gtag.ecommerce.beginCheckout(items, total);
};

export const trackPurchase = (orderId, items, total, shipping, tax) => {
  gtag.ecommerce.purchase(orderId, items, total, shipping, tax);
};

// User Events
export const trackUserSignUp = (method = 'email') => {
  gtag.event({
    action: 'sign_up',
    category: 'user',
    label: method
  });
};

export const trackUserLogin = (method = 'email') => {
  gtag.event({
    action: 'login',
    category: 'user',
    label: method
  });
};

// Prescription Events
export const trackPrescriptionUpload = (prescriptionData) => {
  gtag.event({
    action: 'prescription_upload',
    category: 'prescription',
    label: prescriptionData?.type || 'standard',
    value: prescriptionData?.itemCount || 1
  });
};

export const trackPrescriptionVerification = (status, prescriptionId) => {
  gtag.event({
    action: 'prescription_verification',
    category: 'prescription',
    label: status,
    value: 1,
    item_data: {
      prescription_id: prescriptionId
    }
  });
};

export const trackPrescriptionLinkClick = (source) => {
  gtag.event({
    action: 'prescription_link_click',
    category: 'engagement',
    label: source || 'unknown',
    value: 1,
    item_data: {
      click_source: source,
      timestamp: new Date().toISOString()
    }
  });
};

export const trackPrescriptionRefillClick = (source) => {
  gtag.event({
    action: 'prescription_refill_click',
    category: 'engagement',
    label: source || 'unknown',
    value: 1,
    item_data: {
      click_source: source,
      timestamp: new Date().toISOString()
    }
  });
};

export const trackDeliveryLinkClick = (source, deliveryType) => {
  gtag.event({
    action: 'delivery_link_click',
    category: 'engagement',
    label: `${source}_${deliveryType}`,
    value: 1,
    item_data: {
      click_source: source,
      delivery_type: deliveryType,
      timestamp: new Date().toISOString()
    }
  });
};

export const trackPrescriptionFormStart = () => {
  gtag.event({
    action: 'prescription_form_start',
    category: 'engagement',
    label: 'form_start',
    value: 1
  });
};

export const trackPrescriptionFormComplete = (success) => {
  gtag.event({
    action: 'prescription_form_complete',
    category: 'engagement',
    label: success ? 'success' : 'failure',
    value: 1,
    item_data: {
      status: success ? 'completed' : 'failed',
      timestamp: new Date().toISOString()
    }
  });
};

// Loyalty Events
export const trackLoyaltyPointsEarned = (points, source) => {
  gtag.event({
    action: 'earn_points',
    category: 'loyalty',
    label: source || 'purchase',
    value: points,
    item_data: {
      points_earned: points,
      source: source
    }
  });
};

export const trackLoyaltyPointsRedeemed = (points, discount) => {
  gtag.event({
    action: 'redeem_points',
    category: 'loyalty',
    label: 'discount',
    value: points,
    item_data: {
      points_redeemed: points,
      discount_amount: discount
    }
  });
};

// Enhanced Loyalty Events
export const trackTierProgress = (userId, currentTier, progress, pointsToNextTier) => {
  gtag.event({
    action: 'tier_progress',
    category: 'loyalty',
    label: currentTier,
    value: progress,
    item_data: {
      user_id: userId,
      current_tier: currentTier,
      progress_percentage: progress,
      points_to_next_tier: pointsToNextTier
    }
  });
};

export const trackRewardRedemptionPattern = (userId, rewardType, pointsCost, timeToRedeem) => {
  gtag.event({
    action: 'reward_redemption_pattern',
    category: 'loyalty',
    label: rewardType,
    value: pointsCost,
    item_data: {
      user_id: userId,
      reward_type: rewardType,
      points_cost: pointsCost,
      time_to_redeem: timeToRedeem,
      timestamp: new Date().toISOString()
    }
  });
};

export const trackEngagementFrequency = (userId, lastVisit, currentVisit, actionsPerformed) => {
  const timeBetweenVisits = currentVisit - lastVisit;
  gtag.event({
    action: 'engagement_frequency',
    category: 'loyalty',
    label: userId,
    value: timeBetweenVisits,
    item_data: {
      user_id: userId,
      time_between_visits: timeBetweenVisits,
      actions_performed: actionsPerformed,
      visit_timestamp: currentVisit.toISOString()
    }
  });
}; 