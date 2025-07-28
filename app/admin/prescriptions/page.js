"use client";

import { motion } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaClock } from 'react-icons/fa';

export default function AdminPrescriptions() {
  const features = [
    {
      icon: FaShieldAlt,
      title: "Secure Verification",
      description: "Advanced verification workflow for pharmacists"
    },
    {
      icon: FaClock,
      title: "Real-time Processing",
      description: "Instant prescription status updates and notifications"
    },
    {
      icon: FaRocket,
      title: "Streamlined Approval",
      description: "Efficient approval and rejection system with notes"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 rounded-full">
            <FaRocket className="text-4xl" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Prescription Verification System Coming Soon!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Our advanced prescription verification system for pharmacists is currently under development.
        </p>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-12">
          <p className="text-primary font-semibold text-lg">
            🚧 Admin Prescription Management
          </p>
          <p className="text-gray-600 mt-2">
            This powerful verification and management system will be available when prescription services launch!
          </p>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 text-center relative overflow-hidden"
            >
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Coming Soon
                </span>
              </div>
              
              <div className="flex justify-center mb-4 opacity-30">
                <feature.icon className="text-4xl text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 opacity-30">{feature.title}</h3>
              <p className="text-gray-600 text-sm opacity-30">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Expected Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-8 text-left"
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
            What to Expect in the Admin System
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Verification Features</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• High-resolution prescription image viewer</li>
                <li>• Doctor and patient information verification</li>
                <li>• Approval/rejection with detailed notes</li>
                <li>• Audit trail for all verification actions</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Management Tools</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Real-time prescription queue management</li>
                <li>• Batch processing capabilities</li>
                <li>• Integration with pharmacy inventory</li>
                <li>• Automated notifications and alerts</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}