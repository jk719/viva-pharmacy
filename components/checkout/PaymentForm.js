"use client";

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

const CheckoutForm = ({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      console.log('🔄 Starting payment submission...');
      
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        console.error('❌ Payment confirmation error:', error);
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment confirmed successfully');
        
        // Emit payment completed event with animation flag
        eventEmitter.emit(Events.PAYMENT_COMPLETED, {
          userId: session.user.id,
          amount: amount.total,
          animate: true,
          timestamp: new Date().toISOString()
        });

        // Wait briefly before redirecting
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/checkout/success');
      }
    } catch (error) {
      console.error('❌ Payment submission error:', error);
      setError('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOrderConfirmation = async (paymentIntent) => {
    const response = await fetch('/api/orders/confirmations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderNumber: paymentIntent.id,
            email: session?.user?.email,
            items: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            deliveryFee: deliveryMethod === 'delivery' ? amount.deliveryFee : 0,
            subtotal: amount.subtotal,
            tax: amount.tax,
            total: amount.total,
            shippingAddress,
            deliveryMethod,
            selectedTime,
            customerName: session?.user?.name || 'Valued Customer'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to send order confirmation');
    }

    return response.json();
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

export default function PaymentForm({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) {
  const { getFormattedItems } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const { data: session } = useSession();

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

        const requestId = `${session?.user?.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

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

    initializePayment();
  }, [amount, amountDetails, session?.user?.id, deliveryMethod, selectedTime]);

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
          <CheckoutForm 
            amount={amount}
            amountDetails={amountDetails}
            items={items}
            shippingAddress={shippingAddress}
            deliveryMethod={deliveryMethod}
            selectedTime={selectedTime}
          />
        </Elements>
      )}
    </div>
    
  );
}