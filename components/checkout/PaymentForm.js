"use client";

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required'
      });

      if (submitError) {
        console.error('❌ Payment confirmation error:', submitError);
        setError(submitError.message);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful:', paymentIntent.id);
        sessionStorage.setItem('paymentProcessed', 'true');
        sessionStorage.setItem('paymentIntentId', paymentIntent.id);
        
        clearCart();
        window.location.href = `${window.location.origin}/checkout/success`;
      }
    } catch (err) {
      console.error('❌ Unexpected payment error:', err);
      setError('An unexpected error occurred during payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
        disabled={!stripe || isProcessing}
        className="w-full mt-4 bg-primary text-white py-3 px-6 rounded-lg font-semibold 
                 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90
                 transition-opacity duration-200"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
};

export default function PaymentForm({ amount, items, shippingAddress, deliveryMethod, selectedTime }) {
  const { getFormattedItems } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const initializePayment = async () => {
      if (!amount || amount <= 0) {
        setError('Invalid payment amount');
        setIsLoading(false);
        return;
      }

      try {
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
          cartItems: cartItems,
          deliveryMethod,
          selectedTime,
          shippingAddress: formattedAddress
        };

        console.log('💰 Initializing payment:', {
          amountInDollars: amount,
          items: cartItems.length,
          delivery: deliveryMethod
        });

        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Payment initialization failed');
        }

        const data = await response.json();
        console.log('✅ Payment initialized successfully');
        setClientSecret(data.clientSecret);

      } catch (err) {
        console.error('❌ Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [amount, shippingAddress, deliveryMethod, selectedTime, session, getFormattedItems]);

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
    <div className="w-full max-w-md mx-auto">
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
          <CheckoutForm amount={amount} />
        </Elements>
      )}
    </div>
  );
}