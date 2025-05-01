"use client";

import { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import CheckoutForm from './CheckoutForm';

export default function PaymentForm({ amount, amountDetails, items, shippingAddress, deliveryMethod, selectedTime }) {
  const { 
    getFormattedItems, 
  } = useCart();
  const { data: session } = useSession();
  
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [requestId] = useState(() => `${Date.now()}_${Math.random().toString(36).slice(2)}`);

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
          console.error('[PaymentForm] Cart is empty, cannot initialize payment.');
          setError('Cannot process payment for an empty cart.');
          setIsLoading(false);
          return;
        }

        const payload = {
          amount: amount,
          amountDetails,
          cartItems: cartItems,
          deliveryMethod,
          selectedTime,
          shippingAddress: formattedAddress,
          requestId: requestId
        };

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
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('Client secret not received from server.');
        }

      } catch (err) {
        console.error('[PaymentForm] Error initializing payment:', err);
        setError(err.message || 'Failed to initialize payment');
        setPaymentInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(initializePayment, 100);
    return () => clearTimeout(timeoutId);
  }, [amount, amountDetails, getFormattedItems, deliveryMethod, selectedTime, shippingAddress, paymentInitialized, requestId]);

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
    <>
      {clientSecret ? (
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
            <CheckoutForm
              amount={amount}
              amountDetails={amountDetails}
              items={items}
              shippingAddress={shippingAddress}
              deliveryMethod={deliveryMethod}
              selectedTime={selectedTime}
            />
          </div>
        </Elements>
      ) : (
        !isLoading && <div className="text-red-500 text-center py-4">Could not initialize payment form. Please refresh or contact support.</div>
      )}
    </>
  );
}