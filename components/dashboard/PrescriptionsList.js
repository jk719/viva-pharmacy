"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPrescription, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

export default function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/user/prescriptions');
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock className="text-yellow-500" />;
      case 'Verified':
        return <FaCheck className="text-green-500" />;
      case 'Rejected':
        return <FaTimes className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Prescriptions</h2>
        <Link
          href="/prescriptions/upload"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Upload New
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <motion.div
              key={prescription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaPrescription className="text-primary text-xl" />
                  <div>
                    <p className="font-medium">Dr. {prescription.doctorName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(prescription.status)}
                  <span className={`text-sm font-medium ${
                    prescription.status === 'Verified' ? 'text-green-600' :
                    prescription.status === 'Rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
              </div>

              {prescription.status === 'Verified' && !prescription.purchased && (
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/prescriptions/checkout/${prescription.id}`}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No prescriptions found. Upload a prescription to get started.
        </div>
      )}
    </div>
  );
} 