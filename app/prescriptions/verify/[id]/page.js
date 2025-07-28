"use client";

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaRocket, FaArrowLeft } from 'react-icons/fa';
import { useEffect } from 'react';

export default function VerificationPage() {
  const { id } = useParams();
  const router = useRouter();

  // Redirect to main prescriptions page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/prescriptions');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 rounded-full">
            <FaRocket className="text-4xl" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Prescription Verification Coming Soon!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          This prescription verification feature is currently under development.
        </p>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <p className="text-primary font-semibold">
            🚧 Prescription ID: {id}
          </p>
          <p className="text-gray-600 mt-2">
            Our verification system will be available when prescription services launch!
          </p>
        </div>

        <button
          onClick={() => router.push('/prescriptions')}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg
                   transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
        >
          <FaArrowLeft />
          <span>Back to Prescriptions</span>
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Redirecting automatically in 3 seconds...
        </p>
      </motion.div>
    </div>
  );
}