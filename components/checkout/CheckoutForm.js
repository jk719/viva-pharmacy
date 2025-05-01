import { useContext, useRef, useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import checkoutService from '@/lib/checkout/checkoutService';
import { trackBeginCheckout, trackPurchase } from '@/utils/checkout';
import eventEmitter, { Events } from '@/lib/eventEmitter';

export default function CheckoutForm({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');

  useEffect(() => {
    trackBeginCheckout(items, amountDetails.total);
  }, [items, amountDetails.total]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isProcessing || paymentStatus === 'processing') return;
    setIsSubmitting(true);
    setPaymentStatus('processing');
    const loadingToast = toast.loading('Processing payment...');

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      toast.error(error.message, { id: loadingToast });
      setPaymentStatus('failed');
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded. Post-payment logic intentionally removed.');
      toast.dismiss(loadingToast);
      toast.success('Payment confirmed by Stripe.');
      setPaymentStatus('succeeded');
      setIsSubmitting(false);

    } else {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = !stripe || isProcessing || isSubmitting || paymentStatus === 'processing';

  return (
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
  );
} 