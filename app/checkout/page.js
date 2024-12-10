"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';
import { FaClock } from 'react-icons/fa';

function CheckoutContent() {
  const { 
    items = [], 
    loading, 
    deliveryOption,
    selectedTime,
    setSelectedTime 
  } = useCart();
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const { data: session } = useSession();
  const [showAllTimes, setShowAllTimes] = useState(false);
  const initialTimeDisplay = 8;

  // Add timeSlots calculation
  const timeSlots = useMemo(() => {
    const slots = [];
    const start = 9 * 60 + 30;
    const end = 19 * 60 + 55;
    const interval = deliveryMethod === 'pickup' ? 15 : 60;

    for (let mins = start; mins <= end; mins += interval) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours;
      const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      slots.push(timeString);
    }
    return slots;
  }, [deliveryMethod]);

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
        <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setDeliveryMethod('delivery')}
            className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
              deliveryMethod === 'delivery'
                ? 'border-[#289d44] bg-[#289d44] text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold mb-1">Home Delivery</div>
            <div className="text-sm text-gray-600">Delivered to your address</div>
          </button>
          
          <button
            onClick={() => setDeliveryMethod('pickup')}
            className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
              deliveryMethod === 'pickup'
                ? 'border-[#289d44] bg-[#289d44] text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold mb-1">Store Pickup</div>
            <div className="text-sm text-gray-600">Pick up at our location</div>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Select Time</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots
            .slice(0, showAllTimes ? timeSlots.length : initialTimeDisplay)
            .map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  selectedTime === time 
                    ? 'bg-[#289d44] text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <FaClock className="text-sm" />
                {time}
              </button>
          ))}
        </div>
        
        {timeSlots.length > initialTimeDisplay && (
          <button
            onClick={() => setShowAllTimes(!showAllTimes)}
            className="mt-3 text-[#289d44] hover:text-[#1e7433] flex items-center justify-center w-full py-2 border border-[#289d44] rounded-lg"
          >
            {showAllTimes ? 'Show Less Times' : `View More Times (${timeSlots.length - initialTimeDisplay} available)`}
          </button>
        )}
      </div>

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

      {deliveryMethod === 'delivery' && (
        <ShippingAddress onAddressSelect={setShippingAddress} />
      )}

      {((deliveryMethod === 'delivery' && shippingAddress) || 
         deliveryMethod === 'pickup') && 
       selectedTime && 
       cartTotal > 0 && (
        <div className="mt-8">
          <PaymentForm 
            amount={cartTotal} 
            items={items}
            shippingAddress={deliveryMethod === 'delivery' ? shippingAddress : null}
            deliveryMethod={deliveryMethod}
            selectedTime={selectedTime}
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