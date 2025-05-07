'use client';

import { useModal, ModalType } from '@/context/ModalContext';
import dynamic from 'next/dynamic';

// Dynamically import modal components to reduce initial load
const OrderSuccessModal = dynamic(() => import('@/components/checkout/OrderSuccessModal'));
const LoyaltyAnimationModal = dynamic(() => import('@/components/checkout/LoyaltyAnimationModal'));
const PrescriptionDeliveryModal = dynamic(() => import('@/components/PrescriptionDeliveryModal'));
const PrescriptionDeliverySuccess = dynamic(() => import('@/components/PrescriptionDeliverySuccess'));
const QuickViewModal = dynamic(() => import('@/components/products/QuickViewModal'));

export default function ModalController() {
  const { activeModal } = useModal();
  
  // For debugging
  console.log('ModalController rendering with activeModal:', activeModal);
  
  // Render nothing if no modal is active
  if (!activeModal) return null;
  
  // Render the appropriate modal based on the type
  switch(activeModal) {
    case ModalType.ORDER_SUCCESS:
      return <OrderSuccessModal />;
    
    case ModalType.LOYALTY_ANIMATION:
      return <LoyaltyAnimationModal />;
    
    case ModalType.PRESCRIPTION_DELIVERY:
      return <PrescriptionDeliveryModal />;
    
    case ModalType.PRESCRIPTION_SUCCESS:
      return <PrescriptionDeliverySuccess />;
    
    case ModalType.QUICK_VIEW:
      return <QuickViewModal />;
    
    default:
      console.warn(`Unknown modal type: ${activeModal}`);
      return null;
  }
} 