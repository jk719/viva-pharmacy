export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log the page view with enhanced data
export const pageview = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('📊 Sending pageview:', { url, title });
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
      page_location: window.location.href
    });
  }
};

// Enhanced event tracking with validation
export const event = ({ action, category, label, value, item_data = null }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('📊 Sending event:', { action, category, label, value, item_data });
    const eventData = {
      event_category: category,
      event_label: label,
      value: value
    };

    // Add enhanced ecommerce data if available
    if (item_data) {
      eventData.items = Array.isArray(item_data) ? item_data : [item_data];
      
      // Add currency for ecommerce events
      eventData.currency = 'USD';
      
      // Add value if not already set
      if (!eventData.value && item_data.price) {
        eventData.value = parseFloat(item_data.price);
      }
    }

    window.gtag('event', action, eventData);
  }
};

// Enhanced ecommerce specific events
export const ecommerce = {
  viewItem: (product) => {
    if (!product) return;
    console.log('📊 Sending view_item:', product);
    
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: parseFloat(product.price),
      items: [{
        item_id: product._id,
        item_name: product.name,
        item_brand: product.brand || 'Unknown',
        item_category: product.category,
        item_variant: product.variant || 'Default',
        price: parseFloat(product.price),
        currency: 'USD'
      }]
    });
  },

  addToCart: (product, quantity = 1) => {
    if (!product) return;
    console.log('📊 Sending add_to_cart:', { product, quantity });
    
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: parseFloat(product.price) * quantity,
      items: [{
        item_id: product._id,
        item_name: product.name,
        item_brand: product.brand || 'Unknown',
        item_category: product.category,
        item_variant: product.variant || 'Default',
        quantity: quantity,
        price: parseFloat(product.price),
        currency: 'USD'
      }]
    });
  },

  beginCheckout: (items, value) => {
    if (!items?.length) return;
    console.log('📊 Sending begin_checkout:', { items, value });
    
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: parseFloat(value),
      items: items.map(item => ({
        item_id: item.productId || item._id,
        item_name: item.name,
        item_brand: item.brand || 'Unknown',
        item_category: item.category,
        item_variant: item.variant || 'Default',
        quantity: item.quantity,
        price: parseFloat(item.price),
        currency: 'USD'
      }))
    });
  },

  purchase: (transactionId, items, value, shipping = 0, tax = 0) => {
    if (!items?.length) return;
    console.log('📊 Sending purchase:', { transactionId, items, value, shipping, tax });
    
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: parseFloat(value),
      currency: 'USD',
      tax: parseFloat(tax),
      shipping: parseFloat(shipping),
      items: items.map(item => ({
        item_id: item.productId || item._id,
        item_name: item.name,
        item_brand: item.brand || 'Unknown',
        item_category: item.category,
        item_variant: item.variant || 'Default',
        quantity: item.quantity,
        price: parseFloat(item.price),
        currency: 'USD'
      }))
    });
  }
}; 