"use client";

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import ReactConfetti from 'react-confetti';
import toast from 'react-hot-toast';
import { LoyaltyCheckoutService } from '@/lib/checkout/loyaltyCheckoutServiceClient';
import { FaGift, FaUndo } from 'react-icons/fa';
import { motion } from 'framer-motion';
import OrderSuccessModal from './OrderSuccessModal';
import LoyaltyBanner from '@/components/loyalty/LoyaltyBanner';
import { trackBeginCheckout, trackPurchase } from '@/lib/analytics/events';

// Create a context to share functions between components
const PaymentContext = createContext(null);

// Utility for timing logs - consolidated to avoid duplication
const persistTimingLog = (msg) => {
  const logs = JSON.parse(sessionStorage.getItem('checkoutTimingLogs') || '[]');
  logs.push({ time: Date.now(), msg });
  sessionStorage.setItem('checkoutTimingLogs', JSON.stringify(logs));
  console.log(`[TIMING] ${msg}:`, Date.now());
};

// Add this custom hook
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const ANIMATION_DURATION = 2000;
const REDIRECT_DELAY = 3000;

const CheckoutForm = ({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) => {
  // Access shared context from parent PaymentForm
  const { 
    handleSuccessfulPayment, 
    orderDetails, 
    setOrderDetails, 
    showConfetti, 
    setShowConfetti 
  } = useContext(PaymentContext) || {};
  
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const { width, height } = useWindowSize();

  // Add payment status tracking
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'succeeded' | 'failed'

  // Track begin checkout when component mounts
  useEffect(() => {
    trackBeginCheckout(items, amountDetails.total);
  }, [items, amountDetails.total]);
  
  // No progress bar animation in payment form to avoid conflicts with
  // the loyalty progress bar animation on the success page

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
    
    // Using global persistTimingLog utility function
    persistTimingLog('Payment submission started');
    console.log('🔄 Starting payment submission...');
      
    // Confirm payment without redirect
    const confirmStart = Date.now();
    persistTimingLog('stripe.confirmPayment called');
    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Only redirect for 3DS auth
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.message, { id: loadingToast });
      setPaymentStatus('failed');
      return;
    }

    const confirmEnd = Date.now();
    persistTimingLog(`stripe.confirmPayment resolved (duration: ${confirmEnd - confirmStart} ms)`);
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment succeeded:', paymentIntent.id);
      setPaymentStatus('succeeded');

      // Track successful purchase with enhanced data
      trackPurchase(
        paymentIntent.id,
        items,
        amountDetails.total,
        amountDetails.deliveryFee || 0,
        amountDetails.tax || 0
      );

      // Store order details
      const orderDetails = {
        orderId: paymentIntent.id,
        items: items,
        total: amountDetails.total,
        tax: amountDetails.tax,
        shipping: amountDetails.deliveryFee,
        deliveryMethod,
        selectedTime,
        pointsEarned: Math.floor(amountDetails.total)  // 1 point per dollar
      };
      setOrderDetails(orderDetails);
      setShowConfetti(true);
      // Don't show modal yet - wait for loyalty animation

      // Store payment info in sessionStorage as a reliable backup
      sessionStorage.setItem('paymentProcessed', 'true');
      sessionStorage.setItem('paymentIntentId', paymentIntent.id);
      sessionStorage.setItem('paymentAmount', amountDetails.total);

      try {
        toast.success('Payment successful!', { id: loadingToast });
        persistTimingLog('Before handleOrderConfirmation');
        const handleOrderStart = Date.now();
        await handleOrderConfirmation(paymentIntent);
        persistTimingLog(`After handleOrderConfirmation (duration: ${Date.now() - handleOrderStart} ms)`);

        // Process loyalty points with proper event handling
        persistTimingLog('Before loyalty points update');
        const loyaltyStart = Date.now();
        await handleSuccessfulPayment(paymentIntent);
        persistTimingLog(`After loyalty points update (duration: ${Date.now() - loyaltyStart} ms)`);

        persistTimingLog('Before clearCart');
        const clearCartStart = Date.now();
        await clearCart();
        persistTimingLog(`After clearCart (duration: ${Date.now() - clearCartStart} ms)`);

        // Create the order details object that we need to pass to the success page
        const orderData = {
          orderId: paymentIntent.id,
          points: Math.floor(amountDetails.total),
          deliveryMethod: deliveryMethod || 'delivery', 
          selectedTime: selectedTime || '',
          timestamp: Date.now()
        };
        
        // Store order details in sessionStorage as a reliable backup
        console.log('💾 Storing order details in sessionStorage:', orderData);
        sessionStorage.setItem('orderSuccessData', JSON.stringify(orderData));
        
        console.log('✅ Payment completed successfully:', {
          orderId: paymentIntent.id,
          points: Math.floor(amountDetails.total)
        });
        
        const completionTime = Date.now();
        persistTimingLog(`Payment completed (ms since confirmPayment: ${completionTime - confirmEnd})`);
        
        // Set up data for animation and success page
        const earnedPoints = Math.round(amountDetails.total);
        setPointsEarned(earnedPoints);

        // Store order data for later use
        const paymentOrderData = {
          orderId: paymentIntent.id,
          points: earnedPoints,
          deliveryMethod: deliveryMethod,
          selectedTime,
          timestamp: Date.now()
        };
        
        // Store in sessionStorage for the success page
        sessionStorage.setItem('orderSuccessData', JSON.stringify(paymentOrderData));
        sessionStorage.setItem('paymentCompletedAt', Date.now().toString());

        // Show loyalty animation if points were earned
        if (earnedPoints > 0) {
          console.log('🎁 Showing loyalty animation before redirect');
          setShowLoyaltyAnimation(true);
          
          // Set timeout to navigate after animation (or immediately if animation fails)
          const redirectTimer = setTimeout(() => {
            try {
              // Create URL params for success page
              const successParams = new URLSearchParams({
                orderId: paymentIntent.id,
                points: earnedPoints,
                deliveryMethod: deliveryMethod || 'delivery',
                selectedTime: selectedTime || '',
                ts: Date.now() // Timestamp to prevent caching issues
              }).toString();
              
              console.log('🔜 Navigating to success page after animation');
              window.location.href = `/checkout/success?${successParams}`;
            } catch (redirectError) {
              console.error('Error during redirect:', redirectError);
              // Fallback to minimal params
              window.location.href = `/checkout/success?orderId=${paymentIntent.id}&error=true`;
            }
          }, loyaltyAnimationCompleted ? 0 : 2500); // Wait 2.5s for animation if not already completed
        } else {
          // No points earned, redirect immediately
          try {
            const successParams = new URLSearchParams({
              orderId: paymentIntent.id,
              points: 0,
              deliveryMethod: deliveryMethod || 'delivery',
              selectedTime: selectedTime || '',
              ts: Date.now()
            }).toString();
            
            console.log('🔜 No points earned, redirecting immediately');
            window.location.href = `/checkout/success?${successParams}`;
          } catch (redirectError) {
            console.error('Error during immediate redirect:', redirectError);
            // Fallback to minimal params
            window.location.href = `/checkout/success?orderId=${paymentIntent.id}`;
          }
        }
        
        // No need for component unmount since we're navigating away
      } catch (err) {
        // Better error handling - stringify the error if possible
        const errorMessage = err ? (err.message || JSON.stringify(err)) : 'Unknown error';
        console.error('Post-payment error:', errorMessage);
        
        // Show an error toast to the user
        toast.error('Payment completed but there was an issue with processing rewards');
        
        // Even if there's an error, try to navigate to success page
        try {
          // Error case - create minimal success params
          // Make the params as simple as possible to avoid further errors
          console.log('⚠️ Error in payment completion flow, using minimal redirect');
          
          // Use the simplest possible redirect to avoid further errors
          window.location.href = `/checkout/success?orderId=${paymentIntent.id}&error=true`;
        } catch (navError) {
          // Last resort - show error modal
          console.error('Fatal navigation error:', navError);
          toast.error('Unable to redirect to confirmation page');
        }
      }
    }
  };

  const handleOrderConfirmation = async (paymentIntent) => {
    // Using global persistTimingLog utility function
    persistTimingLog('handleOrderConfirmation: start');
    // Format all numbers before sending
    persistTimingLog('handleOrderConfirmation: before format amounts/items');
    const formattedAmount = {
      subtotal: parseFloat(amountDetails.subtotal || 0).toFixed(2),
      tax: parseFloat(amountDetails.tax || 0).toFixed(2),
      total: parseFloat(amountDetails.total || 0).toFixed(2),
      deliveryFee: parseFloat(
        deliveryMethod === 'delivery' ? amountDetails.deliveryFee : 0
      ).toFixed(2)
    };

    const formattedItems = items.map(item => ({
    name: item.name,
    price: parseFloat(item.price || 0).toFixed(2),
    quantity: parseInt(item.quantity || 1),
    image: item.image,
    hasImage: !!item.image,
    productId: item._id || item.id // Include product ID
  }));
  persistTimingLog('handleOrderConfirmation: after format amounts/items');

    persistTimingLog('handleOrderConfirmation: before fetch');
  const fetchStart = Date.now();
  const response = await fetch('/api/orders/confirmations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderNumber: paymentIntent.id,
      email: session?.user?.email,
      items: formattedItems,
      deliveryFee: formattedAmount.deliveryFee,
      subtotal: formattedAmount.subtotal,
      tax: formattedAmount.tax,
      total: formattedAmount.total,
      shippingAddress,
      deliveryMethod,
      selectedTime,
      customerName: session?.user?.name || 'Valued Customer'
    })
  });
  persistTimingLog(`handleOrderConfirmation: after fetch (duration: ${Date.now() - fetchStart} ms)`);

    persistTimingLog('handleOrderConfirmation: before response.json()');
  if (!response.ok) {
    const errorData = await response.json();
    persistTimingLog('handleOrderConfirmation: response not ok');
    throw new Error(errorData.error || 'Failed to send order confirmation');
  }
  const jsonStart = Date.now();
  const result = await response.json();
  persistTimingLog(`handleOrderConfirmation: after response.json() (duration: ${Date.now() - jsonStart} ms)`);

  return result;
};

  // Add cleanup for confetti
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      // Only clear storage if payment failed
      if (paymentStatus === 'failed') {
        sessionStorage.removeItem('paymentProcessed');
        sessionStorage.removeItem('paymentIntentId');
        sessionStorage.removeItem('paymentAmount');
      }
    };
  }, [paymentStatus]);

  // Prevent form submission during processing
  const isFormDisabled = !stripe || isProcessing || isSubmitting || paymentStatus === 'processing';

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={20}
          colors={['#FF9F43', '#0066cc', '#10B981', '#3B82F6']}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {error && (
          <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        {/* Removed progress bar animation to prevent visual conflicts with loyalty animation */}

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
    </>
  );
};

const OrderSummary = ({ amountDetails, redemptionApplied }) => {
  const {
    subtotal,
    deliveryFee,
    tax,
    total,
    loyaltyDiscount
  } = amountDetails;

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
};

// Remove loyalty animation function - we're showing the modal directly

export default function PaymentForm({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) {
  const { 
    getFormattedItems, 
    applyLoyaltyRedemption, 
    cancelLoyaltyRedemption, 
    redemptionApplied, 
    pointsRedeemed 
  } = useCart();
  const { data: session } = useSession();
  
  // Define all state in one place to avoid duplication
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loyaltyBenefits, setLoyaltyBenefits] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [redemptionError, setRedemptionError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'succeeded' | 'failed'
  // Track discounted amount after applying coupons/loyalty
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  // Generate a unique request ID for payment tracking
  const [requestId] = useState(() => `${Date.now()}_${Math.random().toString(36).slice(2)}`);
  // Animation states
  const [showLoyaltyAnimation, setShowLoyaltyAnimation] = useState(false);
  const [loyaltyAnimationCompleted, setLoyaltyAnimationCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  

  // Add progress state
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paymentInitialized || !amount || amount <= 0) {
      return;
    }

    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setPaymentInitialized(true);

        const formattedAddress = shippingAddress ? {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || 'US'
        } : null;

        const cartItems = getFormattedItems();
        if (!cartItems.length) {
          throw new Error('Cart is empty');
        }

        const payload = {
          amount: amount,
          amountDetails,
          cartItems: cartItems,
          deliveryMethod,
          selectedTime,
          shippingAddress: formattedAddress,
          requestId: requestId // Using the requestId from state
        };

        console.log('💰 Initializing payment:', {
          amountInDollars: amount,
          items: cartItems.length,
          delivery: deliveryMethod,
          requestId: requestId // Using the requestId from state
        });

        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Payment-Request-ID': requestId
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Payment initialization failed');
        }

        const data = await response.json();
        if (data.clientSecret) {
          console.log('✅ Payment initialized successfully');
          setClientSecret(data.clientSecret);
        }

      } catch (err) {
        console.error('❌ Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment');
        setPaymentInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the initialization
    const timeoutId = setTimeout(initializePayment, 100);
    return () => clearTimeout(timeoutId);
  }, [amount, amountDetails, session?.user?.id, deliveryMethod, selectedTime]);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const response = await fetch('/api/loyalty/coupons');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.coupons) {
          setAvailableCoupons(data.coupons);
        } else {
          setAvailableCoupons([]);
        }
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
        setAvailableCoupons([]); // Set empty array on error
      }
    };

    if (session?.user) {
      fetchLoyaltyData();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      calculateLoyaltyBenefits();
    }
  }, [session, amount]);

  const calculateLoyaltyBenefits = async () => {
    try {
      const benefits = await LoyaltyCheckoutService.calculateLoyaltyBenefits(
        session.user,
        amount
      );
      setLoyaltyBenefits(benefits);
    } catch (error) {
      console.error('Error calculating loyalty benefits:', error);
    }
  };

  const handleCouponSelect = async (coupon) => {
    try {
      const response = await fetch('/api/loyalty/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: coupon.code })
      });

      const data = await response.json();
      if (data.amount) {
        setSelectedCoupon(coupon);
        setDiscountedAmount(amount - data.amount);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    }
  };

  // Main loyalty processing function - made available via context
  const handleSuccessfulPayment = async (paymentIntent) => {
    console.log('✅ Processing loyalty rewards for order:', paymentIntent.id);
    try {
      // Update loyalty points with consistent amount
      const updatedAmount = typeof amount === 'undefined' ? amountDetails?.total : amount;
      await fetch('/api/loyalty/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentIntent.id,
          amount: updatedAmount
        })
      });

      // Mark coupon as used if one was applied
      if (selectedCoupon) {
        await fetch('/api/loyalty/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ couponCode: selectedCoupon.code })
        });
      }

      console.log('✅ Loyalty points updated successfully');
      // Emit event for loyalty update completed
      eventEmitter.emit(Events.LOYALTY_POINTS_UPDATED, {
        orderId: paymentIntent.id,
        amount: updatedAmount
      });
    } catch (error) {
      console.error('Error processing loyalty rewards:', error);
      // Continue with checkout even if loyalty processing fails
    }
  };

  // Add effect to fetch user data for loyalty
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;
      
      try {
        setIsLoadingUserData(true);
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUserData(false);
      }
    };
    
    fetchUserData();
  }, [session]);

  // Add function to handle redemption
  const handleRedeemPoints = async () => {
    setRedemptionError(null);
    
    if (!userData || userData.vivaBucks < 100) {
      setRedemptionError('Not enough VivaBucks available. You need at least 100 VivaBucks to redeem.');
      return;
    }
    
    const result = await applyLoyaltyRedemption(100);
    if (!result.success) {
      setRedemptionError(result.error || 'Failed to redeem points. Please try again.');
    } else {
      // Update the discounted amount when redemption is successful (100 points = $10)
      setDiscountedAmount(prevAmount => prevAmount - 10);
      toast.success(`Redeemed 100 VivaBucks for $10 off!`);
    }
  };

  // Function to handle cancellation of loyalty redemption
  const handleCancelRedemption = () => {
    // Restore the original amount by adding $10 back (this assumes points were redeemed)
    if (redemptionApplied) {
      setDiscountedAmount(prevAmount => prevAmount + 10);
    }
    // Call the original cancelLoyaltyRedemption function
    cancelLoyaltyRedemption();
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p>Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
        <p className="font-medium">Payment Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderSummary 
        amountDetails={amountDetails}
        redemptionApplied={redemptionApplied}
      />

      {/* Loyalty Benefits Section */}
      {session?.user && userData && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-semibold text-blue-900">
            VivaBucks Rewards Summary
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Points</span>
              <span>{loyaltyBenefits.basePoints}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Tier Multiplier ({loyaltyBenefits.tierMultiplier}x)</span>
              <span>+{(loyaltyBenefits.basePoints * loyaltyBenefits.tierMultiplier) - loyaltyBenefits.basePoints}</span>
            </div>

            {loyaltyBenefits.eventBenefits.bonusPoints > 0 && (
              <div className="flex justify-between text-sm">
                <span>Bonus Points</span>
                <span>+{loyaltyBenefits.eventBenefits.bonusPoints}</span>
              </div>
            )}

            {loyaltyBenefits.appliedEvents.map((event, index) => (
              <div key={index} className="text-sm text-blue-600">
                {event.name} applied: {event.multiplier}x multiplier
              </div>
            ))}

            <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
              <span>Total Points You'll Earn</span>
              <span>{loyaltyBenefits.totalPoints}</span>
            </div>

            {/* Add VivaBucks Redemption Section */}
            <div className="border-t border-blue-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Available VivaBucks</span>
                <span>{userData.vivaBucks}</span>
              </div>
              
              {userData.vivaBucks >= 100 && !redemptionApplied ? (
                <button
                  onClick={handleRedeemPoints}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors"
                >
                  <FaGift className="text-lg" />
                  Redeem 100 VivaBucks for $10 off
                </button>
              ) : redemptionApplied ? (
                <div className="mt-2">
                  <div className="bg-green-100 text-green-800 p-2 rounded flex justify-between items-center">
                    <span>100 VivaBucks redeemed for $10 discount</span>
                    <button 
                      onClick={handleCancelRedemption}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaUndo className="text-lg" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-600">
                  {userData.vivaBucks < 100 ? 
                    `You need ${100 - userData.vivaBucks} more VivaBucks to redeem a $10 discount.` :
                    'You can redeem VivaBucks for discounts.'
                  }
                </div>
              )}
              
              {redemptionError && (
                <div className="mt-2 text-red-600 text-sm">{redemptionError}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update checkout summary to show redemption */}
      {redemptionApplied && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${amountDetails.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>VivaBucks Discount</span>
              <span>-$10.00</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${amountDetails.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${amountDetails.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Total</span>
              <span>${amountDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {showLoyaltyAnimation && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center flex-col">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Payment Complete! 🎉</h2>
            <p className="mb-6">You earned {pointsEarned} VivaBucks!</p>
            
            {/* Use the existing LoyaltyBanner with forceAnimation */}
            <div className="w-full mb-8">
              <LoyaltyBanner 
                forceAnimation={true} 
                onProgressBarAnimationComplete={() => {
                  console.log('✅ Animation completed in payment form');
                  setLoyaltyAnimationCompleted(true);
                  
                  // Force a redirect after animation completes as a safeguard
                  try {
                    const safeParams = new URLSearchParams({
                      orderId: paymentIntent?.id || sessionStorage.getItem('currentOrderId'),
                      points: pointsEarned,
                      ts: Date.now()
                    }).toString();
                    console.log('🔁 Forcing redirect after animation completion');
                    setTimeout(() => {
                      window.location.href = `/checkout/success?${safeParams}`;
                    }, 500);
                  } catch (e) {
                    console.error('Error in animation completion redirect:', e);
                  }
                }}
              />
            </div>
            
            <p className="text-sm text-gray-500">Redirecting to confirmation page...</p>
          </div>
        </div>
      )}

      {clientSecret && (
        <PaymentContext.Provider value={{ 
          handleSuccessfulPayment, 
          orderDetails, 
          setOrderDetails,
          showConfetti, 
          setShowConfetti
        }}>
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0066cc',
                },
              },
            }}
          >
            <div>
              {availableCoupons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Available Coupons</h3>
                  <div className="space-y-2">
                    {availableCoupons.map((coupon) => (
                      <button
                        key={coupon.code}
                        onClick={() => handleCouponSelect(coupon)}
                        className={`w-full p-3 rounded-lg border ${
                          selectedCoupon?.code === coupon.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>${coupon.amount} off your purchase</span>
                          <span className="text-sm text-gray-500">{coupon.code}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <CheckoutForm 
                amount={discountedAmount}
                amountDetails={amountDetails}
                items={items}
                shippingAddress={shippingAddress}
                deliveryMethod={deliveryMethod}
                selectedTime={selectedTime}
              />
            </div>
          </Elements>
        </PaymentContext.Provider>
      )}
    </div>
  );
}