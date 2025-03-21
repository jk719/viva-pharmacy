"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { FaTruck, FaBolt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaTimes, FaCheckCircle, FaMoneyBillWave, FaRegClock } from 'react-icons/fa';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe/client';
import { validateAddress } from '@/lib/validation/addressValidation';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const DELIVERY_OPTIONS = [
  { 
    id: 'NEXT_DAY',
    label: 'Next Day Delivery',
    price: 0,
    icon: FaTruck,
    description: 'Free • Delivered Tomorrow',
    time: 'By end of day tomorrow'
  },
  { 
    id: 'SAME_DAY',
    label: 'Same Day Delivery',
    price: 5,
    icon: FaClock,
    description: '$5.00 • Express',
    time: 'Today'
  },
  { 
    id: 'ONE_HOUR',
    label: '1 Hour Delivery',
    price: 7,
    icon: FaBolt,
    description: '$7.00 • Priority',
    time: 'Within 1 hour'
  }
];

const calculateEstimatedDelivery = (deliverySpeed) => {
  const now = new Date();
  switch (deliverySpeed) {
    case 'ONE_HOUR':
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    case 'SAME_DAY':
      // Set to 9 PM today
      const sameDay = new Date(now.setHours(21, 0, 0, 0));
      return sameDay;
    case 'NEXT_DAY':
    default:
      // Set to 9 PM tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(21, 0, 0, 0);
      return tomorrow;
  }
};

const StripePaymentForm = ({ clientSecret, onSuccess, onError, onBack, deliveryDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/prescription-delivery/success`,
      },
    });

    if (error) {
      onError(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Details
        </button>
      </div>

      {/* Updated Delivery Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Delivery Summary</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span>Delivery Speed:</span>
            <span className="font-medium">{deliveryDetails.deliverySpeedLabel}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span>Delivery Fee:</span>
            <span className="font-medium text-primary">{deliveryDetails.amount}</span>
          </div>
          <div className="pt-2">
            <p className="font-medium text-gray-700">Delivery Address:</p>
            <p>{deliveryDetails.address}</p>
          </div>
          <div className="pt-2">
            <p className="font-medium text-gray-700">Contact:</p>
            <p>{deliveryDetails.contact}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        <motion.button
          type="submit"
          disabled={isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white
                     transition-all duration-200 ${
                       isProcessing 
                         ? 'bg-gray-400 cursor-not-allowed' 
                         : 'bg-primary hover:bg-primary/90'
                     }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
          ) : (
            'Pay Now'
          )}
        </motion.button>
      </form>
    </div>
  );
};

// Success Message Component
const SuccessMessage = ({ deliveryDetails, onClose }) => {
  useEffect(() => {
    // More subtle confetti
    confetti({
      particleCount: 100,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#0066cc', '#4CAF50', '#FFC107'],
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 20,
    });
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <div className="text-center space-y-6 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-lg"
      >
        <FaCheckCircle className="w-12 h-12 text-green-500" />
      </motion.div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
        <p className="text-gray-600">Your prescription delivery has been confirmed.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <FaTruck className="text-primary text-xl" />
              </div>
              <h4 className="font-semibold text-gray-800 text-lg">Delivery Details</h4>
            </div>
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-700 text-sm font-medium">Confirmed</span>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Delivery Speed */}
            <div className="flex items-start gap-3 p-3 hover:bg-blue-50/50 rounded-lg transition-colors">
              <div className="bg-primary/5 p-2 rounded-full">
                <FaBolt className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Delivery Speed</p>
                <p className="text-gray-800 font-semibold">{deliveryDetails.deliverySpeedLabel}</p>
              </div>
            </div>

            {/* Delivery Fee */}
            <div className="flex items-start gap-3 p-3 hover:bg-blue-50/50 rounded-lg transition-colors">
              <div className="bg-primary/5 p-2 rounded-full">
                <FaMoneyBillWave className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Delivery Fee</p>
                <p className="text-gray-800 font-semibold">{deliveryDetails.amount}</p>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-start gap-3 p-3 hover:bg-blue-50/50 rounded-lg transition-colors">
              <div className="bg-primary/5 p-2 rounded-full">
                <FaRegClock className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                <p className="text-gray-800 font-semibold">{formatDate(deliveryDetails.estimatedDelivery)}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3 p-3 hover:bg-blue-50/50 rounded-lg transition-colors">
              <div className="bg-primary/5 p-2 rounded-full">
                <FaMapMarkerAlt className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                <p className="text-gray-800 font-semibold">{deliveryDetails.address}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex items-start gap-3 p-3 hover:bg-blue-50/50 rounded-lg transition-colors">
              <div className="bg-primary/5 p-2 rounded-full">
                <FaUser className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Contact Information</p>
                <p className="text-gray-800 font-semibold">{deliveryDetails.contact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        className="w-full py-3 px-6 bg-primary text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
      >
        Close
      </motion.button>
    </div>
  );
};

export default function PrescriptionDeliveryModal({ isOpen, onClose }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    deliverySpeed: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const modalRef = useRef(null);
  const paymentSectionRef = useRef(null);

  // Auto-populate form if user is logged in
  useEffect(() => {
    if (session?.user) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user/profile');
          const data = await response.json();
          
          setFormData(prev => ({
            ...prev,
            fullName: data.name || '',
            phone: data.phone || '',
            street: data.address?.street || '',
            apartment: data.address?.apartment || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || ''
          }));
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUserData();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = validateAddress(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (!formData.deliverySpeed) {
      setErrors(prev => ({ ...prev, deliverySpeed: 'Please select a delivery speed' }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/prescription-delivery/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverySpeed: formData.deliverySpeed,
          address: {
            street: formData.street,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          contact: {
            name: formData.fullName,
            phone: formData.phone
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
      setTimeout(scrollToPayment, 100);
    } catch (error) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setShowSuccess(true);
  };

  const handlePaymentError = (errorMessage) => {
    toast.error(errorMessage || 'Payment failed');
    setShowPaymentForm(false); // Go back to form on error
  };

  const handleBackToForm = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return cleaned;
  };

  const scrollToPayment = () => {
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDeliveryOption = (speedId) => {
    return DELIVERY_OPTIONS.find(option => option.id === speedId);
  };

  const formatPrice = (price) => {
    return price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full h-[75vh] 
                       relative overflow-hidden
                       sm:max-w-[95%] md:max-w-[85%] lg:max-w-2xl
                       flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200
                            px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {showSuccess ? 'Order Confirmed' : (showPaymentForm ? 'Complete Payment' : 'Prescription Delivery Details')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors
                           p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-4 sm:px-6 sm:py-6">
                {showSuccess ? (
                  <SuccessMessage 
                    deliveryDetails={{
                      deliverySpeedLabel: getDeliveryOption(formData.deliverySpeed)?.label || '',
                      amount: formatPrice(getDeliveryOption(formData.deliverySpeed)?.price || 0),
                      estimatedDelivery: calculateEstimatedDelivery(formData.deliverySpeed),
                      address: `${formData.street}${formData.apartment ? `, ${formData.apartment}` : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
                      contact: `${formData.fullName} • ${formData.phone}`
                    }}
                    onClose={onClose}
                  />
                ) : !showPaymentForm ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="text-primary" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Enter your full name"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={formatPhoneNumber(formData.phone)}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="(555) 555-5555"
                            maxLength="14"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-primary" />
                        Delivery Address
                      </h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="Street Address"
                        />
                        <input
                          type="text"
                          value={formData.apartment}
                          onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="Apt, Suite, etc. (optional)"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="City"
                          />
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="State"
                          />
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="ZIP Code"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <FaTruck className="text-primary" />
                        Delivery Speed
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {DELIVERY_OPTIONS.map((option) => (
                          <motion.button
                            key={option.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, deliverySpeed: option.id })}
                            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                              formData.deliverySpeed === option.id
                                ? 'border-primary bg-primary/5 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className={`p-3 rounded-full ${
                                formData.deliverySpeed === option.id
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                <option.icon className="text-2xl" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{option.label}</div>
                                <div className="text-sm text-gray-600">{option.description}</div>
                                <div className="text-xs text-gray-500">{option.time}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                      {errors.deliverySpeed && (
                        <p className="text-red-500 text-sm">{errors.deliverySpeed}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-white
                               transition-all duration-200 ${
                                 isLoading 
                                   ? 'bg-gray-400 cursor-not-allowed' 
                                   : 'bg-primary hover:bg-primary/90'
                                 }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Continue to Payment'
                      )}
                    </motion.button>
                  </form>
                ) : (
                  <div ref={paymentSectionRef} className="space-y-4">
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
                        <StripePaymentForm
                          clientSecret={clientSecret}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          onBack={handleBackToForm}
                          deliveryDetails={{
                            deliverySpeedLabel: getDeliveryOption(formData.deliverySpeed)?.label || '',
                            amount: formatPrice(getDeliveryOption(formData.deliverySpeed)?.price || 0),
                            address: `${formData.street}${formData.apartment ? `, ${formData.apartment}` : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
                            contact: `${formData.fullName} • ${formData.phone}`
                          }}
                        />
                      </Elements>
                    ) : (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 