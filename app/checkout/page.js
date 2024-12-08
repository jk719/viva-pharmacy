"use client";

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';

function CheckoutContent() {
  const { items = [], loading, deliveryOption } = useCart();
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!loading) {
      if (!items || items.length === 0) {
        setError('Your cart is empty');
        return;
      }
      
      // Calculate subtotal
      const newSubtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * parseInt(item.quantity));
      }, 0);
      
      // Calculate tax based on shipping address
      const taxAmount = shippingAddress 
        ? calculateTax(newSubtotal, shippingAddress.state, 'NYC') // You can adjust the region logic as needed
        : 0;
      
      setSubtotal(newSubtotal);
      setTax(taxAmount);
      setCartTotal(newSubtotal + taxAmount);
    }
  }, [items, loading, shippingAddress]); // Added shippingAddress to dependencies

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <div className="border rounded-lg shadow-sm">
          {items.map((item) => (
            <div key={item.id || item._id} className="flex items-center p-4 border-b last:border-b-0">
              <div className="relative h-20 w-20 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain rounded-md"
                  sizes="80px"
                />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-gray-600">
                    Quantity: {item.quantity}
                  </div>
                  <div className="font-semibold">
                    ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {shippingAddress && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax ({formatTaxRate(getTaxRate(shippingAddress.state, 'NYC'))}):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <ShippingAddress onAddressSelect={setShippingAddress} />

      {shippingAddress && cartTotal > 0 && (
        <div className="mt-8">
          <PaymentForm 
            amount={cartTotal} 
            items={items}
            shippingAddress={shippingAddress} 
          />
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}