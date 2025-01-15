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
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { clearCart } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
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
        setError(submitError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Clear the cart after successful payment
        clearCart();
        window.location.href = `${window.location.origin}/checkout/success`;
      }
    } catch (err) {
      console.error('❌ Payment confirmation error:', err);
      setError('An unexpected error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-4 bg-primary text-white py-3 px-6 rounded-lg font-semibold 
                 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default function PaymentForm({ amount, items, shippingAddress, deliveryMethod, selectedTime }) {
  const { getFormattedItems } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Get formatted cart items
        const cartItems = getFormattedItems();
        
        // Prepare shipping address for API
        const formattedAddress = shippingAddress ? {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || 'US'
        } : null;

        // Prepare request payload
        const payload = {
          amount: Math.round(amount * 100), // Convert to cents
          cartItems: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          deliveryMethod,
          selectedTime,
          shippingAddress: formattedAddress,
          userId: session?.user?.id || 'guest',
          userEmail: session?.user?.email
        };

        console.log('📦 Initializing payment with:', {
          amount: payload.amount,
          items: payload.cartItems.length,
          delivery: payload.deliveryMethod
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
          throw new Error(errorData.error || 'Payment initialization failed');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);

      } catch (err) {
        console.error('❌ Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      initializePayment();
    }
  }, [amount, shippingAddress, deliveryMethod, selectedTime, session, getFormattedItems]);

  if (loading) {
    return <div className="text-center py-4">Initializing payment...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <p>{error}</p>
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
            },
          }}
        >
          <CheckoutForm amount={amount} />
        </Elements>
      )}
    </div>
  );
}