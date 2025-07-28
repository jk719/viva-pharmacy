"use client";

import { motion } from 'framer-motion';
import { FaUpload, FaClock, FaCheckCircle, FaTruck, FaRocket, FaBell } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function PrescriptionsPage() {
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

  const handleNotifyMe = () => {
    toast.success('Thanks! We\'ll notify you when prescription services launch!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 rounded-full">
            <FaRocket className="text-4xl" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Prescription Services Coming Soon!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          We're working hard to bring you convenient prescription filling and delivery services
        </p>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-primary font-semibold">
            🚧 This feature is currently under development and will be available soon!
          </p>
        </div>
      </motion.div>

      {/* Future Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
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
              <step.icon className="text-4xl text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 opacity-30">{step.title}</h3>
            <p className="text-gray-600 text-sm opacity-30">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Notify Me Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-md p-8 mb-8 text-center"
      >
        <FaBell className="text-4xl text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Be the First to Know!
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Want to be notified when our prescription services go live? We'll send you an update 
          as soon as you can start uploading and filling your prescriptions through our platform.
        </p>
        
        <button
          onClick={handleNotifyMe}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg
                   transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
        >
          <FaBell />
          <span>Notify Me When Available</span>
        </button>
      </motion.div>

      {/* What to Expect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-8 mb-8"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">
          What to Expect When We Launch
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Easy Upload Process</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Simple photo capture from your phone</li>
              <li>• Secure document upload system</li>
              <li>• Quick prescription verification</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Fast & Reliable Service</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Licensed pharmacist verification</li>
              <li>• Same-day delivery options</li>
              <li>• Real-time status updates</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-xl p-6 text-center"
      >
        <h3 className="text-xl font-semibold mb-4 text-blue-900">
          Need Prescription Services Now?
        </h3>
        <p className="text-blue-800 mb-4">
          While we're building our online prescription service, you can still get help with your medications.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <p className="text-gray-800 font-semibold">Contact us directly:</p>
          <p className="text-primary">📞 Call us for immediate assistance</p>
          <p className="text-gray-600 text-sm mt-2">We're here to help with your prescription needs</p>
        </div>
      </motion.div>
    </div>
  );
}