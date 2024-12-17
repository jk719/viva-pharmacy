"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';
import { FaClock, FaTruck, FaStore, FaMapMarkerAlt, FaRegClock, FaBox } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
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
      
      const newSubtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * parseInt(item.quantity));
      }, 0);
      
      const taxAmount = shippingAddress 
        ? calculateTax(newSubtotal, shippingAddress.state, 'NYC')
        : 0;
      
      setSubtotal(newSubtotal);
      setTax(taxAmount);
      setCartTotal(newSubtotal + taxAmount);
    }
  }, [items, loading, shippingAddress]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center text-red-500">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      
      <motion.div 
        className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FaBox className="text-primary" />
          Delivery Method
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'delivery', icon: FaTruck, title: 'Home Delivery', desc: 'Delivered to your address' },
            { id: 'pickup', icon: FaStore, title: 'Store Pickup', desc: 'Pick up at our location' }
          ].map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDeliveryMethod(option.id)}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                deliveryMethod === option.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  deliveryMethod === option.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <option.icon className="text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{option.title}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </div>
              
              {deliveryMethod === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FaClock className="text-primary" />
          Select Time
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {timeSlots.slice(0, displayCount).map((time) => (
              <motion.button
                key={time}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTime(time)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTime === time
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    selectedTime === time 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <FaClock className="text-lg" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-800">{time}</div>
                    <div className="text-xs text-gray-500">
                      {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex justify-center">
          {timeSlots.length > displayCount ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowMore}
              className="text-primary hover:text-primary/80 flex items-center gap-2 px-4 py-2 rounded-full
                       border-2 border-primary/20 hover:border-primary/30 transition-colors"
            >
              <FaClock />
              View More Times ({timeSlots.length - displayCount})
            </motion.button>
          ) : displayCount > INCREMENT_SIZE[windowWidth < 768 ? 'mobile' : 'desktop'] && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowLess}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2 px-4 py-2"
            >
              <FaRegClock />
              Show Less Times
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.div 
        className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
        
        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.id || item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="relative h-20 w-20 bg-white rounded-lg p-2 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-gray-600">Qty: {item.quantity}</div>
                  <div className="font-semibold text-primary">
                    ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {shippingAddress && (
            <div className="flex justify-between items-center text-gray-600">
              <span>Tax ({formatTaxRate(getTaxRate(shippingAddress.state, 'NYC'))})</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xl font-bold text-primary pt-3 border-t">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {deliveryMethod === 'delivery' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <ShippingAddress onAddressSelect={setShippingAddress} />
        </motion.div>
      )}

      {((deliveryMethod === 'delivery' && shippingAddress) || 
         deliveryMethod === 'pickup') && 
       selectedTime && 
       cartTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <PaymentForm 
            amount={cartTotal} 
            items={items}
            shippingAddress={deliveryMethod === 'delivery' ? shippingAddress : null}
            deliveryMethod={deliveryMethod}
            selectedTime={selectedTime}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}