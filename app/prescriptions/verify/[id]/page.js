"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

export default function VerificationPage() {
  const { id } = useParams();
  const [status, setStatus] = useState('pending');
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/prescriptions/${id}/status`);
        const data = await response.json();
        
        if (data.success) {
          setStatus(data.status);
          setPrescription(data.prescription);
          
          if (data.status === 'verified') {
            // Redirect to checkout after short delay
            setTimeout(() => {
              router.push(`/prescriptions/checkout/${id}`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          {status === 'pending' && (
            <>
              <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Verifying Your Prescription
              </h2>
              <p className="text-gray-600">
                Our pharmacist is reviewing your prescription. 
                This usually takes 5-10 minutes.
              </p>
            </>
          )}

          {status === 'verified' && (
            <>
              <FaCheck className="text-4xl text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Prescription Verified!
              </h2>
              <p className="text-gray-600">
                Redirecting you to checkout...
              </p>
            </>
          )}

          {status === 'rejected' && (
            <>
              <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600">
                {prescription?.verificationNotes || 
                  'Please contact our pharmacy for assistance.'}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
} 