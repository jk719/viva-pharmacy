"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPrescriptionBottle, FaClock, FaShieldAlt } from 'react-icons/fa';
import PaymentForm from '@/components/checkout/PaymentForm';

export default function PrescriptionCheckout() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        const response = await fetch(`/api/prescriptions/${id}`);
        const data = await response.json();
        if (data.success) {
          setPrescription(data.prescription);
        }
      } catch (error) {
        console.error('Error loading prescription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrescription();
  }, [id]);

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 0,
      time: '2-4 hours',
      icon: FaClock
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 5.99,
      time: '1 hour',
      icon: FaPrescriptionBottle
    },
    {
      id: 'priority',
      name: 'Priority Delivery',
      price: 9.99,
      time: '30 minutes',
      icon: FaShieldAlt
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prescription Checkout</h1>

      {/* Prescription Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Prescription Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Doctor: {prescription?.doctorName}</p>
            <p className="text-gray-600">
              Prescription ID: {prescription?.prescriptionNumber}
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              Status: <span className="text-green-500">Verified</span>
            </p>
            <p className="text-gray-600">
              Verified by: {prescription?.verifiedBy?.name}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Delivery Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {deliveryOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setDeliveryOption(option.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                deliveryOption === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <option.icon className={`text-2xl mb-2 ${
                deliveryOption === option.id ? 'text-primary' : 'text-gray-400'
              }`} />
              <h3 className="font-semibold">{option.name}</h3>
              <p className="text-sm text-gray-600">{option.time}</p>
              <p className="text-sm font-semibold mt-2">
                {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Payment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <PaymentForm
          amount={prescription?.total || 0}
          deliveryFee={deliveryOptions.find(opt => opt.id === deliveryOption)?.price || 0}
          isPrescription={true}
          prescriptionId={id}
          selectedDeliveryOption={deliveryOption}
        />
      </motion.div>
    </div>
  );
} 