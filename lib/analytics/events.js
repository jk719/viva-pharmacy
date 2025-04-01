import * as gtag from './gtag';

// Product Events
export const trackProductView = (product) => {
  gtag.ecommerce.viewItem(product);
};

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