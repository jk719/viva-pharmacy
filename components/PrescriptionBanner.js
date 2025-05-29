'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaPrescription, FaTruck, FaClock, FaCreditCard, FaUpload, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PrescriptionDeliveryModal from './PrescriptionDeliveryModal';
import { toast } from 'react-hot-toast';
import { trackPrescriptionLinkClick, trackDeliveryLinkClick } from '@/lib/analytics/events';

const BANNER_ITEMS = [
  {
    icon: FaPrescription,
    label: 'Fill & Refill',
    href: '/prescriptions',
    description: 'Upload your prescription',
    requiresAuth: true,
    analyticsId: 'fill_refill'
  },
  {
    icon: FaTruck,
    label: 'Pay for Delivery',
    isModal: true,
    description: 'Schedule delivery',
    analyticsId: 'delivery'
  },
  {
    icon: FaClock,
    label: 'Track Order',
    description: 'Coming Soon',
    isUnderConstruction: true,
    analyticsId: 'track_order'
  }
];

export default function PrescriptionBanner() {
  const { data: session } = useSession();
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleItemClick = (item) => {
    // Track analytics for all clicks
    if (item.analyticsId === 'fill_refill') {
      trackPrescriptionLinkClick('banner');
    } else if (item.analyticsId === 'delivery') {
      trackDeliveryLinkClick('banner', 'prescription');
    }

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
                 border-y border-primary/10 relative"
      style={{ 
        minHeight: 'var(--prescription-banner-height)',
        zIndex: 'var(--z-prescription-banner)'
      }}
    >
      {/* Decorative elements (matching LoyaltyBanner style) */}
      <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 opacity-10 
                    transform rotate-45 translate-x-12 -translate-y-12 pointer-events-none" 
                    style={{ zIndex: 1 }}>
        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light"></div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-3 relative" style={{ zIndex: 2 }}>
          {/* Services Grid */}
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
            {/* Upload Prescription */}
            <Link href="/prescriptions" className="group">
              <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap 
                            px-2 md:px-3 py-1.5 md:py-2 rounded-lg
                            bg-white/80 hover:bg-white transition-all duration-200
                            border border-primary/10 hover:border-primary/20
                            hover:shadow-sm">
                <FaUpload className="text-primary text-xs md:text-sm group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-primary">
                  Upload Rx
                </span>
              </div>
            </Link>

            {/* Prescription Delivery */}
            <button 
              onClick={() => setShowDeliveryModal(true)}
              className="group"
            >
              <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap 
                            px-2 md:px-3 py-1.5 md:py-2 rounded-lg
                            bg-white/80 hover:bg-white transition-all duration-200
                            border border-primary/10 hover:border-primary/20
                            hover:shadow-sm">
                <FaTruck className="text-primary text-xs md:text-sm group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-primary">
                  Rx Delivery
                </span>
              </div>
            </button>

            {/* Insurance Accepted */}
            <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap 
                          px-2 md:px-3 py-1.5 md:py-2 rounded-lg
                          bg-green-50/80 border border-green-200/50">
              <FaCreditCard className="text-green-600 text-xs md:text-sm" />
              <span className="text-xs md:text-sm font-medium text-green-700">
                Insurance OK
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          {session && prescriptions.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 
                         bg-amber-50 rounded-full border border-amber-200"
              >
                <FaCheckCircle className="text-amber-600 text-xs" />
                <span className="text-xs font-medium text-amber-700">
                  {prescriptions.length} Active
                </span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Prescription Delivery Modal */}
      <PrescriptionDeliveryModal 
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
      />
    </motion.div>
  );
} 