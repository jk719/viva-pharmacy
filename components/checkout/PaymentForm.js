"use client";

import { useState, useEffect, useRef } from 'react';
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
import { trackBeginCheckout, trackPurchase } from '@/lib/analytics/events';

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
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  // Removed showSuccessModal state as this is now handled in the success page
  const [orderDetails, setOrderDetails] = useState(null);

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
    
    try {
      console.log('🔄 Starting payment submission...');
      
      // Confirm payment without redirect
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
        // Modal is now shown on the success page instead

        // Store payment info
        sessionStorage.setItem('paymentProcessed', 'true');
        sessionStorage.setItem('paymentIntentId', paymentIntent.id);
        sessionStorage.setItem('paymentAmount', amountDetails.total);

        try {
          toast.success('Payment successful!', { id: loadingToast });
          await handleOrderConfirmation(paymentIntent);
          await clearCart();
          
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
          
          // Create URL with parameters
          const params = new URLSearchParams();
          Object.entries(orderData).forEach(([key, value]) => {
            params.append(key, value);
          });
          
          const successUrl = `/checkout/success?${params.toString()}`;
          
          console.log('🔀 Navigating to success page with params:', {
            url: successUrl,
            orderId: paymentIntent.id,
            points: Math.floor(amountDetails.total)
          });
          
          // PRIMARY APPROACH: Form submission - most reliable for full page navigation
          console.log('📤 Creating form for navigation to success page');
          const form = document.createElement('form');
          form.method = 'post'; // Use POST to force page refresh
          form.action = '/checkout/success';
          form.style.display = 'none';
          
          // Add each parameter as a hidden input
          const addParam = (name, value) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
          };
          
          // Add all parameters to the form
          Object.entries(orderData).forEach(([key, value]) => {
            addParam(key, String(value));
          });
        
          // Add the form to the document and submit it
          document.body.appendChild(form);
          console.log('📤 Submitting form to navigate to success page');
          
          // Try form submission with fallbacks
          try {
            form.submit();
            
            // FALLBACK 1: If form submission doesn't redirect within 1 second, use direct location change
            setTimeout(() => {
              console.log('⚠️ Form submission may have failed, using direct location change');
              // Set a flag to track navigation method used
              sessionStorage.setItem('navigationMethod', 'direct');
              window.location.href = successUrl;
              
              // FALLBACK 2: If direct location change doesn't work within 500ms, try location.replace
              setTimeout(() => {
                console.log('⚠️ Direct location change may have failed, using location.replace');
                sessionStorage.setItem('navigationMethod', 'replace');
                window.location.replace(successUrl);
                
                // FALLBACK 3: Last resort - open in new tab then close current
                setTimeout(() => {
                  console.log('🔴 All navigation methods failed, using anchor click');
                  sessionStorage.setItem('navigationMethod', 'anchor');
                  const a = document.createElement('a');
                  a.href = successUrl;
                  a.target = '_self';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }, 300);
              }, 300);
            }, 1000);
          } catch (navErr) {
            console.error('Form navigation failed:', navErr);
            window.location.href = successUrl;
          }
        } catch (err) {
          console.error('Post-payment error:', err);
          // Even if there's an error in confirmation, try to navigate to success page
          window.location.href = `/checkout/success?orderId=${paymentIntent.id}`;
        }
      }
    } catch (err) {
      console.error('❌ Payment submission error:', err);
      toast.error('An unexpected error occurred', { id: loadingToast });
      setPaymentStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderConfirmation = async (paymentIntent) => {
    // Format all numbers before sending
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send order confirmation');
    }

    return response.json();
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
      {/* OrderSuccessModal removed from here - now displayed on success page */}
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

export default function PaymentForm({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) {
  const { 
    getFormattedItems, 
    applyLoyaltyRedemption, 
    cancelLoyaltyRedemption, 
    redemptionApplied, 
    pointsRedeemed 
  } = useCart();
  const { data: session } = useSession();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [requestId] = useState(() => `${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const [loyaltyBenefits, setLoyaltyBenefits] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [redemptionError, setRedemptionError] = useState(null);
  // Removed showSuccessModal state as this is now handled in the success page
  const [orderDetails, setOrderDetails] = useState(null);

  // Add payment status tracking
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'succeeded' | 'failed'

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
          requestId
        };

        console.log('💰 Initializing payment:', {
          amountInDollars: amount,
          items: cartItems.length,
          delivery: deliveryMethod,
          requestId
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

  const handleSuccessfulPayment = async (paymentIntent) => {
    try {
      // Update loyalty points
      await fetch('/api/loyalty/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentIntent.id,
          amount: amount
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

      // ... rest of success handling
    } catch (error) {
      console.error('Error processing loyalty rewards:', error);
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
      toast.success(`Redeemed 100 VivaBucks for $10 off!`);
    }
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
                      onClick={cancelLoyaltyRedemption}
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

      {clientSecret && (
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
      )}
    </div>
  );
}