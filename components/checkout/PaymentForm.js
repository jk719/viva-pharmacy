"use client";

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
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
        setError(submitError.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Details</h3>
        
        <div className="space-y-4">
          <PaymentElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': {
                    color: '#6b7280',
                  },
                },
              },
            }}
          />

          <AnimatePresence>
            {error && (
              <motion.div 
                className="bg-red-50 text-red-500 text-sm p-3 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-medium
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 
              transition-all duration-200"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Complete Payment'
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
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
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Initializing payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <motion.div 
          className="bg-white rounded-2xl border-2 border-red-100 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-primary hover:text-primary/80 font-medium"
            >
              Try Again
            </button>
          </div>
        </motion.div>
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
                colorPrimary: '#003366',
                borderRadius: '12px',
              },
            },
          }}
        >
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default PaymentForm;