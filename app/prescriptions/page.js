"use client";

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaUpload, FaClock, FaCheckCircle, FaTruck, FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function PrescriptionsPage() {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [doctorInfo, setDoctorInfo] = useState({
    doctorName: '',
    doctorContact: '',
    pharmacy: ''
  });

  const steps = [
    {
      icon: FaUpload,
      title: "Upload Prescription",
      description: "Take a clear photo or scan of your prescription"
    },
    {
      icon: FaClock,
      title: "Verification",
      description: "Our pharmacists will verify your prescription"
    },
    {
      icon: FaCheckCircle,
      title: "Confirmation",
      description: "We'll confirm the availability and price"
    },
    {
      icon: FaTruck,
      title: "Delivery",
      description: "Get your medication delivered to your door"
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
        setShowDoctorForm(true);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const [showDoctorForm, setShowDoctorForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileInputRef.current?.files[0]) {
      toast.error('Please select a prescription image');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('prescriptionImage', fileInputRef.current.files[0]);
    formData.append('details', JSON.stringify(doctorInfo));

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Prescription uploaded successfully!');
        setPreview(null);
        setShowDoctorForm(false);
        setDoctorInfo({ doctorName: '', doctorContact: '', pharmacy: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload prescription');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Fill & Refill Prescriptions
        </h1>
        <p className="text-lg text-gray-600">
          Get your prescriptions filled and delivered safely and conveniently
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <step.icon className="text-4xl text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-8 mb-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
              id="prescription-upload"
            />
            
            <div className="flex flex-col items-center gap-4">
              <label
                htmlFor="prescription-upload"
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg
                         transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaCamera />
                <span>Take Photo or Upload</span>
              </label>
              
              {preview && (
                <div className="mt-4">
                  <img 
                    src={preview} 
                    alt="Prescription preview" 
                    className="max-w-xs mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>

          {showDoctorForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 mt-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor's Name
                </label>
                <input
                  type="text"
                  value={doctorInfo.doctorName}
                  onChange={(e) => setDoctorInfo({...doctorInfo, doctorName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor's Contact
                </label>
                <input
                  type="text"
                  value={doctorInfo.doctorContact}
                  onChange={(e) => setDoctorInfo({...doctorInfo, doctorContact: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Pharmacy (Optional)
                </label>
                <input
                  type="text"
                  value={doctorInfo.pharmacy}
                  onChange={(e) => setDoctorInfo({...doctorInfo, pharmacy: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg
                         transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FaUpload />
                    <span>Submit Prescription</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Important Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold mb-4 text-blue-900">
          Important Information
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Valid prescription from a licensed healthcare provider required</li>
          <li>• Clear, legible image of the entire prescription</li>
          <li>• Verification typically completed within 1-2 hours</li>
          <li>• Same-day delivery available for verified prescriptions</li>
          <li>• Contact us for any questions about your prescription</li>
        </ul>
      </motion.div>
    </div>
  );
} 