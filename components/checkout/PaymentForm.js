"use client";

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { useSession } from "next-auth/react";

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const updatePoints = async () => {
    if (!session?.user?.id) return;
    
    try {
      // Use the exact amount passed from checkout
      const points = Math.floor(amount);
      
      const response = await fetch(`/api/user/vivabucks/${session.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points,
          source: 'purchase'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update points');
      }

      eventEmitter.emit(Events.POINTS_UPDATED);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

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
        await updatePoints();
        window.location.href = `${window.location.origin}/checkout/success`;
      }
    } catch (err) {
      setError('An unexpected error occurred.');
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

const PaymentForm = ({ amount, items, shippingAddress, deliveryMethod, selectedTime }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cartItems: items,
            shippingAddress,
            deliveryMethod,
            selectedTime
          })
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else if (!data.clientSecret) {
          setError('Failed to initialize payment');
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        setError('Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [items, shippingAddress, deliveryMethod, selectedTime]);

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
};

export default PaymentForm;