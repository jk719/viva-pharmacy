"use client";

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';

const PaymentForm = ({ amount, items }) => { // Add items prop
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      if (!amount) {
        console.log('No amount provided');
        setError('Invalid payment amount');
        setLoading(false);
        return;
      }

      console.log('Initializing payment for amount:', amount);
      
      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount,
            cartItems: items // Pass cart items to the API
          })
        });

        const data = await response.json();
        console.log('Payment initialization response:', data);

        if (data.error) {
          setError(data.error);
        } else if (!data.clientSecret) {
          setError('Failed to initialize payment');
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [amount, items]); // Add items to dependency array

  if (loading) {
    return <div className="text-center py-4">Initializing payment...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <p>{error}</p>
        <p className="text-sm mt-2">Amount: ${amount}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return <div>Waiting for payment initialization...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Elements stripe={stripePromise} options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
          },
        },
      }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Payment form submitted');

    if (!stripe || !elements) {
      console.error('Stripe not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (submitError) {
        console.error('Payment confirmation error:', submitError);
        setError(submitError.message);
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#003366] text-white py-3 px-6 rounded-lg font-semibold 
            disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
      >
        {loading ? (
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

export default PaymentForm;