"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const response = await fetch('/api/admin/prescriptions');
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (approved) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/prescriptions/${selectedPrescription.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          note: verificationNote
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(approved ? 'Prescription approved' : 'Prescription rejected');
        loadPrescriptions();
        setSelectedPrescription(null);
        setVerificationNote('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to process verification');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prescription Verification</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Prescriptions List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <FaSpinner className="animate-spin text-2xl text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <motion.button
                  key={prescription.id}
                  onClick={() => setSelectedPrescription(prescription)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPrescription?.id === prescription.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {prescription.doctorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Patient: {prescription.patientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Verification Panel */}
        {selectedPrescription && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Verify Prescription</h2>
            
            <div className="mb-6">
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={selectedPrescription.prescriptionImage}
                  alt="Prescription"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <p><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
                <p><strong>Contact:</strong> {selectedPrescription.doctorContact}</p>
                {selectedPrescription.pharmacy.name && (
                  <div>
                    <p><strong>Previous Pharmacy:</strong></p>
                    <p className="text-sm text-gray-600">
                      {selectedPrescription.pharmacy.name}<br />
                      {selectedPrescription.pharmacy.phone}<br />
                      {selectedPrescription.pharmacy.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Verification Notes
              </label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="Add any notes about the verification..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleVerification(true)}
                disabled={processing}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg
                         flex items-center justify-center gap-2"
              >
                {processing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Approve
              </button>
              <button
                onClick={() => handleVerification(false)}
                disabled={processing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg
                         flex items-center justify-center gap-2"
              >
                {processing ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                Reject
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 