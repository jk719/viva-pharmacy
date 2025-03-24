'use client';

import { motion } from 'framer-motion';
import { FaPrescription, FaTruck, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PrescriptionDeliveryModal from './PrescriptionDeliveryModal';
import { toast } from 'react-hot-toast';

const BANNER_ITEMS = [
  {
    icon: FaPrescription,
    label: 'Fill & Refill',
    href: '/prescriptions',
    description: 'Upload your prescription',
    requiresAuth: true
  },
  {
    icon: FaTruck,
    label: 'Pay for Delivery',
    isModal: true,
    description: 'Schedule delivery'
  },
  {
    icon: FaClock,
    label: 'Track Order',
    description: 'Coming Soon',
    isUnderConstruction: true
  }
];

export default function PrescriptionBanner() {
  const { data: session } = useSession();
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const handleItemClick = (item) => {
    if (item.isUnderConstruction) {
      toast('Coming soon!', {
        icon: 'ℹ️',
        style: {
          background: '#EFF6FF',
          color: '#1E40AF',
          border: '1px solid #BFDBFE',
        },
        duration: 3000,
      });
      return;
    }

    if (item.requiresAuth && !session) {
      toast.error('Please sign in to access this feature');
      return;
    }

    if (item.isModal) {
      setShowDeliveryModal(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="prescription-banner w-full bg-gradient-to-r from-primary/5 to-primary/10 
                 border-y border-primary/10 relative overflow-hidden"
    >
      {/* Decorative elements (matching LoyaltyBanner style) */}
      <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 opacity-10 
                    transform rotate-45 translate-x-12 -translate-y-12 z-0">
        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light"></div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-3 z-10 relative">
          {/* Services Grid */}
          <div className="flex items-center gap-3 md:gap-6">
            {BANNER_ITEMS.map((item) => (
              item.isModal ? (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-2 text-[11px] md:text-base text-primary 
                           hover:text-primary-light transition-colors"
                >
                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </motion.button>
              ) : item.isUnderConstruction ? (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-2 text-[11px] md:text-base text-gray-500
                           hover:text-gray-600 transition-colors cursor-help"
                >
                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                </motion.button>
              ) : (
                <Link
                  key={item.label}
                  href={session || !item.requiresAuth ? item.href : '#'}
                  onClick={e => {
                    if (!session && item.requiresAuth) {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                  className="flex items-center gap-2 text-[11px] md:text-base text-primary 
                           hover:text-primary-light transition-colors"
                >
                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Quick Help */}
          <div className="hidden md:block">
            <span className="text-sm text-primary-light">
              Need help? Call us at (718) 450-9595
            </span>
          </div>
        </div>
      </div>

      <PrescriptionDeliveryModal 
        isOpen={showDeliveryModal} 
        onClose={() => setShowDeliveryModal(false)}
      />
    </motion.div>
  );
} 