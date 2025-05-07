import { useContext, useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import checkoutService from '@/lib/checkout/checkoutService';
import { trackBeginCheckout, trackPurchase, triggerLocalWebhook } from '@/utils/checkout';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useRouter } from 'next/navigation';
import { useModal, ModalType } from '@/context/ModalContext';

export default function CheckoutForm({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) {
  console.log('CheckoutForm RENDER', { amount, deliveryMethod, hasItems: !!items?.length });
  
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const router = useRouter();
  
  // Modal context
  const { showModal } = useModal();
  
  useEffect(() => {
    trackBeginCheckout(items, amountDetails?.total);
  }, [items, amountDetails?.total]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isProcessing || paymentStatus === 'processing') return;
    
    try {
      setIsSubmitting(true);
      setPaymentStatus('processing');
      const loadingToast = toast.loading('Processing payment...');

      if (!stripe || !elements) {
        toast.error('Stripe not initialized');
        setIsSubmitting(false);
        return;
      }

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          // Return to the same page instead of redirecting
          return_url: window.location.href,
        }
      });

      if (error) {
        console.error('Payment error:', error);
        toast.error(error.message, { id: loadingToast });
        setPaymentStatus('failed');
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded with ID:', paymentIntent.id);
        toast.dismiss(loadingToast);
        toast.success('Payment confirmed by Stripe.');
        setPaymentStatus('succeeded');
        
        // Track the purchase for analytics
        trackPurchase(items, amountDetails?.total);
        
        // In development, trigger the local webhook to create the order
        const isLocalhost = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        
        // Calculate points earned
        const calculatedPoints = Math.round(amount * 1);
        
        let orderDetailsObj = {
          orderId: paymentIntent.id,
          // Include both field names for consistency
          total: amount,
          amount: amount,
          deliveryMethod,
          selectedTime,
          items: items,
          // Store points with both field names for consistency
          pointsEarned: calculatedPoints,
          loyaltyPointsEarned: calculatedPoints,
        };
        
        if (isLocalhost) {
          console.log('LOCAL DEV: Triggering local webhook');
          try {
            const webhookResponse = await triggerLocalWebhook(
              paymentIntent.id,
              session?.user?.id,
              items, 
              shippingAddress, 
              deliveryMethod, 
              selectedTime
            );
            
            if (webhookResponse && webhookResponse.success) {
              // Ensure both field names are present
              orderDetailsObj = {
                ...webhookResponse,
                // Ensure amount field is present (use total if available, or the original amount)
                amount: webhookResponse.amount || webhookResponse.total || amount,
                // Ensure total field is present (use amount if available, or the original total)
                total: webhookResponse.total || webhookResponse.amount || amount,
                // Ensure points fields are present
                pointsEarned: webhookResponse.pointsEarned || calculatedPoints,
                loyaltyPointsEarned: webhookResponse.loyaltyPointsEarned || webhookResponse.pointsEarned || calculatedPoints
              };
              console.log('Using webhook response for order details:', orderDetailsObj);
            }
          } catch (err) {
            console.error('Error triggering webhook:', err);
          }
        }
        
        // Clear the shopping cart
        clearCart();
        
        // Emit the payment completed event with all relevant data
        eventEmitter.emit(Events.PAYMENT_COMPLETED, {
          type: Events.PAYMENT_COMPLETED,
          paymentIntentId: paymentIntent.id,
          orderId: orderDetailsObj.orderId,
          userId: session?.user?.id,
          amount: amount,
          total: amount,
          deliveryMethod,
          selectedTime,
          // Include both field names
          loyaltyPointsEarned: orderDetailsObj.loyaltyPointsEarned,
          pointsEarned: orderDetailsObj.pointsEarned,
          items: items,
          timestamp: new Date().toISOString()
        });
        
        // Store the orderDetails in localStorage for recovery if needed
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('viva_payment_completed', JSON.stringify({
              timestamp: Date.now(),
              data: {
                orderId: orderDetailsObj.orderId,
                total: amount,
                amount: amount,
                deliveryMethod,
                selectedTime,
                items: items,
                // Include both field names for maximum compatibility
                loyaltyPointsEarned: orderDetailsObj.loyaltyPointsEarned,
                pointsEarned: orderDetailsObj.pointsEarned
              }
            }));
          } catch (err) {
            console.error('Error storing payment data in localStorage:', err);
          }
        }
        
        // Redirect to success page instead of showing modal directly
        // The success page will handle showing the appropriate modals
        router.push('/checkout/success');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('An unexpected error occurred during checkout.');
      setPaymentStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = !stripe || isProcessing || isSubmitting || paymentStatus === 'processing';

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {error && (
          <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isFormDisabled}
          className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold 
                     transition-all duration-200 relative
                     ${isFormDisabled 
                       ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                       : 'bg-primary text-white hover:opacity-90'}`}
        >
          {paymentStatus === 'processing' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
          ) : (
            'Pay Now'
          )}
        </button>
      </form>
      
      {/* Development testing tools */}
      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <div className="mt-4 p-2 bg-gray-100 text-xs border border-gray-300 rounded">
          <p><strong>Debug Tools:</strong></p>
          <button 
            onClick={() => {
              const points = 20;
              const testAmount = amount || 19.99;
              const testData = {
                orderId: 'test-' + Date.now(),
                total: testAmount,
                amount: testAmount,
                deliveryMethod,
                selectedTime,
                items,
                loyaltyPointsEarned: points,
                pointsEarned: points
              };
              showModal(ModalType.ORDER_SUCCESS, testData);
            }}
            className="mr-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Test Success Modal
          </button>
          <button 
            onClick={() => {
              const points = 20;
              const testAmount = amount || 19.99;
              const testData = {
                orderId: 'test-' + Date.now(),
                total: testAmount,
                amount: testAmount,
                deliveryMethod,
                selectedTime,
                items,
                loyaltyPointsEarned: points,
                pointsEarned: points
              };
              showModal(ModalType.LOYALTY_ANIMATION, testData);
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          >
            Test Loyalty Modal
          </button>
        </div>
      )}
    </>
  );
} 