"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';
import { FaClock, FaTruck, FaStore, FaMapMarkerAlt, FaRegClock, FaBox, FaBolt, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Define INCREMENT_SIZE as a regular constant outside of any components
const INCREMENT_SIZE = {
  desktop: 100,
  mobile: 50
};

// Add these constants at the top of the file
const STORE_HOURS = {
  0: { open: '13:00', close: '20:00' }, // Sunday    1-8 PM
  1: { open: '09:30', close: '18:30' }, // Monday    9:30 AM-6:30 PM
  2: { open: '09:30', close: '18:30' }, // Tuesday   9:30 AM-6:30 PM
  3: { open: '09:30', close: '18:30' }, // Wednesday 9:30 AM-6:30 PM
  4: { open: '09:30', close: '18:30' }, // Thursday  9:30 AM-6:30 PM
  5: { open: '09:30', close: '18:30' }, // Friday    9:30 AM-6:30 PM
  6: { open: '12:00', close: '17:00' }  // Saturday  12-5 PM
};

// Add these constants at the top
const DELIVERY_OPTIONS = {
  SAME_DAY: { label: 'Same Day Delivery', fee: 0, hours: 24 },
  TWO_HOUR: { label: '2 Hour Delivery', fee: 5, hours: 2 },
  ONE_HOUR: { label: '1 Hour Delivery', fee: 7, hours: 1 }
};

// Update these constants at the top of the file
const SLOTS_PER_PAGE = {
  desktop: 8,
  mobile: 8
};

// Helper functions
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTimeDisplay = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDateDisplay = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

function CheckoutContent() {
  const { 
    items = [], 
    loading, 
    deliveryOption,
    selectedTime,
    setSelectedTime,
    deliverySpeed,
    setDeliverySpeed,
    deliveryFee,
    DELIVERY_FEES
  } = useCart();
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const { data: session } = useSession();
  const router = useRouter();

  const [displayCount, setDisplayCount] = useState(
    SLOTS_PER_PAGE[typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop']
  );

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (!session) {
      router.push('/?showLogin=true&redirect=/checkout');
    }
  }, [session, router]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setDisplayCount(SLOTS_PER_PAGE[window.innerWidth < 768 ? 'mobile' : 'desktop']);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleShowMore = () => {
    setDisplayCount(prev => Math.min(prev + SLOTS_PER_PAGE[windowWidth < 768 ? 'mobile' : 'desktop'], timeSlots.length));
  };

  const handleShowLess = () => {
    setDisplayCount(SLOTS_PER_PAGE[windowWidth < 768 ? 'mobile' : 'desktop']);
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const endDate = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    // Adjust interval and end time based on delivery speed
    let interval = deliveryMethod === 'pickup' ? 15 : 60;
    let effectiveEndDate = endDate;
    
    if (deliveryMethod === 'delivery') {
      const deliveryOption = DELIVERY_OPTIONS[deliverySpeed];
      effectiveEndDate = new Date(now.getTime() + (deliveryOption.hours * 60 * 60 * 1000));
    }

    // Round current time up to next interval
    const roundToNext = (date, intervalMinutes) => {
      const minutes = date.getMinutes();
      const roundedMinutes = Math.ceil(minutes / intervalMinutes) * intervalMinutes;
      const result = new Date(date);
      result.setMinutes(roundedMinutes);
      result.setSeconds(0);
      result.setMilliseconds(0);
      if (roundedMinutes >= 60) {
        result.setHours(result.getHours() + 1);
        result.setMinutes(roundedMinutes - 60);
      }
      return result;
    };

    let currentDate = roundToNext(now, interval);

    while (currentDate <= effectiveEndDate) {
      const day = currentDate.getDay();
      const hours = STORE_HOURS[day];
      
      if (hours) {
        const storeOpenTime = new Date(currentDate);
        const [openHours, openMinutes] = hours.open.split(':').map(Number);
        storeOpenTime.setHours(openHours, openMinutes, 0, 0);

        const storeCloseTime = new Date(currentDate);
        const [closeHours, closeMinutes] = hours.close.split(':').map(Number);
        storeCloseTime.setHours(closeHours, closeMinutes, 0, 0);

        if (currentDate >= storeOpenTime && currentDate <= storeCloseTime) {
          const slot = {
            id: `${currentDate.getTime()}_${deliveryMethod}`,
            dateTime: new Date(currentDate),
            time: formatTimeDisplay(currentDate),
            date: formatDateDisplay(currentDate),
            full: currentDate.toISOString()
          };
          slots.push(slot);
        }
      }

      // Increment by interval
      currentDate = new Date(currentDate.getTime() + interval * 60000);
    }

    return slots;
  }, [deliveryMethod, deliverySpeed]);

  useEffect(() => {
    if (!loading) {
      if (!items || items.length === 0) {
        setError('Your cart is empty');
        return;
      }
      
      const newSubtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * parseInt(item.quantity));
      }, 0);
      
      // Calculate delivery fee
      const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEES[deliverySpeed] : 0;
      
      // Calculate tax on subtotal AND delivery fee
      const taxAmount = shippingAddress 
        ? calculateTax(newSubtotal + deliveryFee, shippingAddress.state, 'NYC')
        : 0;
      
      setSubtotal(newSubtotal);
      setTax(taxAmount);
      // Update total to include delivery fee
      setCartTotal(newSubtotal + deliveryFee + taxAmount);
    }
  }, [items, loading, shippingAddress, deliveryMethod, deliverySpeed]);

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

      {deliveryMethod === 'delivery' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6"
        >
          <h3 className="text-lg font-medium text-gray-800 mb-4">Delivery Speed</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                id: 'SAME_DAY', 
                label: 'Same Day Delivery', 
                fee: 0, 
                desc: 'Free • Delivered Today',
                icon: FaCalendarAlt,
                time: 'By end of day'
              },
              { 
                id: 'TWO_HOUR', 
                label: '2 Hour Delivery', 
                fee: 5, 
                desc: '$5.00 • Express',
                icon: FaClock,
                time: 'Within 2 hours'
              },
              { 
                id: 'ONE_HOUR', 
                label: '1 Hour Delivery', 
                fee: 7, 
                desc: '$7.00 • Priority',
                icon: FaBolt,
                time: 'Within 1 hour'
              }
            ].map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setDeliverySpeed(option.id);
                  // Set a default time based on the delivery speed
                  const now = new Date();
                  setSelectedTime(now.toISOString());
                }}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  deliverySpeed === option.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-full ${
                    deliverySpeed === option.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <option.icon className="text-2xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.time}</div>
                  </div>
                </div>
                {deliverySpeed === option.id && (
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
      )}

      {deliveryMethod === 'pickup' && (
        <motion.div 
          className="mb-8 bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaClock className="text-primary" />
            Select Pickup Time
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {timeSlots.slice(0, displayCount).map((slot) => (
                <motion.button
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTime(slot.full)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedTime === slot.full
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-full ${
                      selectedTime === slot.full
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FaClock className="text-lg" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-800">{slot.time}</div>
                      <div className="text-xs text-gray-600">{slot.date}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center">
            {timeSlots.length > displayCount ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShowMore}
                className="text-primary hover:text-primary/80 flex items-center gap-2 px-6 py-3 rounded-full
                         border-2 border-primary/20 hover:border-primary/30 transition-colors"
              >
                <FaClock className="text-lg" />
                <span>Show More Times ({timeSlots.length - displayCount} remaining)</span>
              </motion.button>
            ) : displayCount > SLOTS_PER_PAGE[windowWidth < 768 ? 'mobile' : 'desktop'] && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShowLess}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2 px-6 py-3 rounded-full
                         border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <FaRegClock className="text-lg" />
                <span>Show Less Times</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

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
          {deliveryMethod === 'delivery' && (
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-2">
                <span>Delivery Fee</span>
                {deliverySpeed === 'ONE_HOUR' && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    1 Hour Priority
                  </span>
                )}
                {deliverySpeed === 'TWO_HOUR' && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    2 Hour Express
                  </span>
                )}
                {deliverySpeed === 'SAME_DAY' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Free Delivery
                  </span>
                )}
              </span>
              <span>${DELIVERY_FEES[deliverySpeed].toFixed(2)}</span>
            </div>
          )}
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
            amountDetails={{ 
              subtotal,
              deliveryFee: deliveryMethod === 'delivery' ? DELIVERY_FEES[deliverySpeed] : 0,
              tax,
              total: cartTotal
            }}
            items={items}
            shippingAddress={deliveryMethod === 'delivery' ? shippingAddress : null}
            deliveryMethod={deliveryMethod}
            selectedTime={selectedTime}
            deliverySpeed={deliverySpeed}
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