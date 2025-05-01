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