"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import Image from 'next/image';
import { calculateTax, formatTaxRate, getTaxRate } from '@/lib/tax/taxRates';
import ShippingAddress from '@/components/checkout/ShippingAddress';
import { useSession } from 'next-auth/react';
import { FaClock, FaTruck, FaStore } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function CheckoutContent() {
  const { items = [], loading, deliveryOption, selectedTime, setSelectedTime } = useCart();
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const { data: session } = useSession();

  // Time slots calculation
  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = currentHour; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === currentHour && minute <= currentMinute) continue;
        const time = new Date();
        time.setHours(hour, minute);
        slots.push(time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }));
      }
    }
    return slots;
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div 
        className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Checkout
        </h1>

        {/* Delivery Method Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Choose Delivery Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'delivery', icon: FaTruck, title: 'Home Delivery', desc: 'Delivered to your address' },
              { id: 'pickup', icon: FaStore, title: 'Store Pickup', desc: 'Pick up at our location' }
            ].map((method) => (
              <motion.button
                key={method.id}
                onClick={() => setDeliveryMethod(method.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200
                  ${deliveryMethod === method.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-100 hover:border-primary/20'}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl
                    transition-colors duration-200 ${
                      deliveryMethod === method.id 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <method.icon className="text-xl" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{method.title}</div>
                    <div className="text-sm text-gray-500">{method.desc}</div>
                  </div>
                </div>
                
                {deliveryMethod === method.id && (
                  <motion.div 
                    className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 
                      flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            Select {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Time
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map((time) => (
              <motion.button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-200
                  ${selectedTime === time 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-100 hover:border-primary/20'}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl 
                    transition-colors duration-200 ${
                      selectedTime === time 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-50 text-gray-600 group-hover:bg-gray-100'
                    }`}
                  >
                    <FaClock className="text-lg" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{time}</div>
                    <div className="text-xs text-gray-500 mt-1">Available</div>
                  </div>
                </div>

                {selectedTime === time && (
                  <motion.div 
                    className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 
                      flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                className="flex items-center p-4 rounded-2xl border-2 border-gray-100"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50/50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </div>
                    <div className="font-bold text-gray-900">
                      ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="mt-4 p-4 rounded-2xl border-2 border-gray-100 space-y-2">
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
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {deliveryMethod === 'delivery' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Shipping Address</h2>
            <ShippingAddress onAddressSelect={setShippingAddress} />
          </div>
        )}

        {/* Payment Form */}
        {((deliveryMethod === 'delivery' && shippingAddress) || 
           deliveryMethod === 'pickup') && 
         selectedTime && 
         cartTotal > 0 && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-100 rounded-xl w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-24 bg-gray-100 rounded-2xl"></div>
                <div className="h-24 bg-gray-100 rounded-2xl"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}