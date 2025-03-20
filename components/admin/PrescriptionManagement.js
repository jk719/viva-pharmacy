"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  FaPrescription, FaSearch, FaFilter, 
  FaCheck, FaTimes, FaClock, FaDownload 
} from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = {
  ALL: 'all',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export default function PrescriptionManagement() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(STATUSES.PENDING);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchStats();
  }, [selectedStatus]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/prescriptions/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        search: searchTerm
      });
      
      const response = await fetch(`/api/admin/prescriptions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (approved) => {
    setProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/prescriptions/${selectedPrescription.id}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approved,
            note: verificationNote
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(
          approved ? 'Prescription approved' : 'Prescription rejected'
        );
        fetchPrescriptions();
        fetchStats();
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

  const downloadPrescriptionImage = async (prescription) => {
    try {
      const response = await fetch(prescription.prescriptionImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <motion.div
            key={status}
            className={`p-4 rounded-lg shadow-sm border ${
              selectedStatus === status ? 'border-primary' : 'border-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedStatus(status)}
          >
            <div className="flex items-center justify-between">
              <span className="capitalize">{status}</span>
              <span className="text-2xl font-bold">{count}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          {Object.values(STATUSES).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg ${
                selectedStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Prescriptions</h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {prescriptions.map((prescription) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-lg border cursor-pointer ${
                    selectedPrescription?.id === prescription.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{prescription.patientName}</p>
                      <p className="text-sm text-gray-600">
                        Dr. {prescription.doctorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted: {format(new Date(prescription.createdAt), 'PPp')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPrescriptionImage(prescription);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <FaDownload className="text-gray-500" />
                      </button>
                      {prescription.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Verification Panel */}
        <AnimatePresence>
          {selectedPrescription && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-lg shadow-lg p-6 border"
            >
              <h3 className="text-xl font-semibold mb-4">
                Verify Prescription
              </h3>
              
              <div className="space-y-4">
                <div className="relative aspect-square w-full">
                  <Image
                    src={selectedPrescription.prescriptionImage}
                    alt="Prescription"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Patient:</strong> {selectedPrescription.patientName}
                  </p>
                  <p>
                    <strong>Doctor:</strong> {selectedPrescription.doctorName}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedPrescription.doctorContact}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Add any notes about the verification..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerification(true)}
                    disabled={processing}
                    className="flex-1 bg-green-500 hover:bg-green-600 
                             text-white py-2 px-4 rounded-lg
                             flex items-center justify-center gap-2"
                  >
                    <FaCheck />
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerification(false)}
                    disabled={processing}
                    className="flex-1 bg-red-500 hover:bg-red-600 
                             text-white py-2 px-4 rounded-lg
                             flex items-center justify-center gap-2"
                  >
                    <FaTimes />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 