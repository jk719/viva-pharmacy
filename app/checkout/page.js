"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';
import { FaClock, FaTruck, FaStore, FaMapMarkerAlt, FaRegClock, FaBox, FaBolt } from 'react-icons/fa';
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

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    deliveryMethod: false,
    deliverySpeed: false,
    time: false,
    address: false
  });

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
    // Return empty array if no delivery method selected
    if (!deliveryMethod) return [];
    
    const slots = [];
    const now = new Date();
    const endDate = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    // Adjust interval and end time based on delivery speed
    let interval = deliveryMethod === 'pickup' ? 15 : 60;
    let effectiveEndDate = endDate;
    
    if (deliveryMethod === 'delivery' && deliverySpeed) {
      const deliveryOption = DELIVERY_OPTIONS[deliverySpeed];
      if (deliveryOption) { // Add null check here
        effectiveEndDate = new Date(now.getTime() + (deliveryOption.hours * 60 * 60 * 1000));
      } else {
        return []; // Return empty array if delivery option is invalid
      }
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

  // Add validation check function
  const validateSelections = () => {
    const errors = {
      deliveryMethod: !deliveryMethod,
      deliverySpeed: deliveryMethod === 'delivery' && !deliverySpeed,
      time: !selectedTime,
      address: deliveryMethod === 'delivery' && !shippingAddress
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Update payment form rendering condition
  const shouldShowPaymentForm = useMemo(() => {
    return (
      cartTotal > 0 &&
      deliveryMethod &&
      selectedTime &&
      (deliveryMethod === 'pickup' || (deliveryMethod === 'delivery' && shippingAddress && deliverySpeed))
    );
  }, [cartTotal, deliveryMethod, selectedTime, shippingAddress, deliverySpeed]);

  // Add validation message component
  const ValidationMessage = ({ show, message }) => {
    if (!show) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm mt-2"
      >
        {message}
      </motion.div>
    );
  };

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
          {!deliveryMethod && (
            <span className="text-sm font-normal text-red-500 ml-2">
              (Required)
            </span>
          )}
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
                  key={`checkmark-${option.id}`}
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
        
        <ValidationMessage 
          show={validationErrors.deliveryMethod} 
          message="Please select a delivery method"
        />
      </motion.div>

      {deliveryMethod === 'delivery' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaBolt className="text-primary" />
            Delivery Speed
            {!deliverySpeed && (
              <span className="text-sm font-normal text-red-500 ml-2">
                (Required)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                id: 'SAME_DAY', 
                label: 'Same Day Delivery', 
                fee: 0, 
                desc: 'Free • Delivered Today',
                icon: FaClock,
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
                    key={`checkmark-speed-${option.id}`}
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
          
          <ValidationMessage 
            show={validationErrors.deliverySpeed} 
            message="Please select a delivery speed"
          />
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
            {!selectedTime && (
              <span className="text-sm font-normal text-red-500">
                (Please select a pickup time)
              </span>
            )}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {timeSlots.slice(0, displayCount).map((slot) => (
                <motion.button
                  key={`${slot.id}-${slot.full}`}
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
          
          <ValidationMessage 
            show={validationErrors.time} 
            message="Please select a pickup time"
          />
        </motion.div>
      )}

      {deliveryMethod === 'delivery' && (
        <motion.div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" />
            Delivery Address
            {!shippingAddress && (
              <span className="text-sm font-normal text-red-500 ml-2">
                (Required)
              </span>
            )}
          </h2>
          
          <ShippingAddress onAddressSelect={setShippingAddress} />
          
          <ValidationMessage 
            show={validationErrors.address} 
            message="Please enter a delivery address"
          />
        </motion.div>
      )}

      {shouldShowPaymentForm && (
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