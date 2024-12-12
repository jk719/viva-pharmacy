"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';
import { FaClock, FaTruck, FaStore, FaMapMarkerAlt, FaRegClock } from 'react-icons/fa';

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
  const INCREMENT_SIZE = {
    desktop: 9,
    mobile: 6
  };

  const [displayCount, setDisplayCount] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 
      ? INCREMENT_SIZE.mobile 
      : INCREMENT_SIZE.desktop
  );

  // Add window width state
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Reset display count when screen size changes
      setDisplayCount(window.innerWidth < 768 ? INCREMENT_SIZE.mobile : INCREMENT_SIZE.desktop);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleShowMore = () => {
    const increment = windowWidth < 768 ? INCREMENT_SIZE.mobile : INCREMENT_SIZE.desktop;
    setDisplayCount(prev => Math.min(prev + increment, timeSlots.length));
  };

  const handleShowLess = () => {
    const initialCount = windowWidth < 768 ? INCREMENT_SIZE.mobile : INCREMENT_SIZE.desktop;
    setDisplayCount(initialCount);
  };

  // Calculate initial display count based on device and delivery method
  const getInitialDisplayCount = () => {
    const isMobile = windowWidth < 768; // md breakpoint
    return deliveryMethod === 'pickup'
      ? isMobile ? INCREMENT_SIZE.mobile : INCREMENT_SIZE.desktop
      : isMobile ? INCREMENT_SIZE.mobile : INCREMENT_SIZE.desktop;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setDeliveryMethod('delivery')}
            className={`relative p-4 rounded-lg border transition-all ${
              deliveryMethod === 'delivery'
                ? 'border-[#289d44] bg-white shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                deliveryMethod === 'delivery' ? 'bg-[#289d44] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaTruck className="text-xl" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Home Delivery</div>
                <div className="text-sm text-gray-600">Delivered to your address</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                deliveryMethod === 'delivery'
                  ? 'border-[#289d44] bg-[#289d44]'
                  : 'border-gray-300'
              }`}>
                {deliveryMethod === 'delivery' && (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </div>
            {deliveryMethod === 'delivery' && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-[#289d44] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ✓
                </div>
              </div>
            )}
          </button>
          
          <button
            onClick={() => setDeliveryMethod('pickup')}
            className={`relative p-4 rounded-lg border transition-all ${
              deliveryMethod === 'pickup'
                ? 'border-[#289d44] bg-white shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                deliveryMethod === 'pickup' ? 'bg-[#289d44] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaStore className="text-xl" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Store Pickup</div>
                <div className="text-sm text-gray-600">Pick up at our location</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                deliveryMethod === 'pickup'
                  ? 'border-[#289d44] bg-[#289d44]'
                  : 'border-gray-300'
              }`}>
                {deliveryMethod === 'pickup' && (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </div>
            {deliveryMethod === 'pickup' && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-[#289d44] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ✓
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots
            .slice(0, displayCount)
            .map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`relative p-4 rounded-lg border transition-all ${
                  selectedTime === time
                    ? 'border-[#289d44] bg-white shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    selectedTime === time ? 'bg-[#289d44] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedTime === time ? <FaClock className="text-xl" /> : <FaRegClock className="text-xl" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{time}</div>
                    <div className="text-sm text-gray-600">
                      {deliveryMethod === 'delivery' ? 'Delivery Time' : 'Pickup Time'}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedTime === time
                      ? 'border-[#289d44] bg-[#289d44]'
                      : 'border-gray-300'
                  }`}>
                    {selectedTime === time && (
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </div>
                {selectedTime === time && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-[#289d44] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
        </div>
        
        {timeSlots.length > displayCount && (
          <button
            onClick={handleShowMore}
            className="mt-4 text-[#289d44] hover:text-[#1e7433] flex items-center justify-center w-full py-2 border border-[#289d44] rounded-lg transition-colors"
          >
            <FaClock className="mr-2" />
            View More Times ({timeSlots.length - displayCount} available)
          </button>
        )}

        {displayCount > (windowWidth < 768 ? INCREMENT_SIZE.mobile : INCREMENT_SIZE.desktop) && (
          <button
            onClick={handleShowLess}
            className="mt-2 text-gray-600 hover:text-gray-800 flex items-center justify-center w-full py-2"
          >
            <FaRegClock className="mr-2" />
            Show Less Times
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