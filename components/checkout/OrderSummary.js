import { motion } from 'framer-motion';

export default function OrderSummary({ amountDetails, redemptionApplied }) {
  const {
    subtotal,
    deliveryFee,
    tax,
    total,
  } = amountDetails;

  const handleRedirect = (orderId) => {
    // Only redirect if we're still on the page
    if (document.visibilityState !== 'hidden') {
      const url = checkoutService.createSuccessRedirectUrl(orderId);
      window.location.href = url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
    >
      <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {redemptionApplied && (
          <div className="flex justify-between text-green-600">
            <span>VivaBucks Discount</span>
            <span>-$10.00</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
          <span>Total Due</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
} 