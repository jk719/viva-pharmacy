"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { STATES, calculateTax, formatTaxRate, getTaxRate, hasRegions, getRegions } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
  const { items = [], loading, deliveryOption } = useCart();
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [selectedState, setSelectedState] = useState('NY');
  const [selectedRegion, setSelectedRegion] = useState('NYC');
  const [shippingAddress, setShippingAddress] = useState(null);
  const { data: session } = useSession();

  console.log('Checkout session:', session);

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
      
      // Calculate tax based on location
      const taxAmount = calculateTax(newSubtotal, selectedState, selectedRegion);
      
      setSubtotal(newSubtotal);
      setTax(taxAmount);
      setCartTotal(newSubtotal + taxAmount);
    }
  }, [items, loading, selectedState, selectedRegion]);

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

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedRegion(''); // Reset region when state changes
  };

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

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Shipping Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.entries(STATES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            
            {hasRegions(selectedState) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Region</option>
                  {getRegions(selectedState).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Tax ({formatTaxRate(getTaxRate(selectedState, selectedRegion))}):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
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
            items={items} // Pass cart items to PaymentForm
            shippingAddress={shippingAddress} 
          />
        </div>
      )}
    </div>
  );
}