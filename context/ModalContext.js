import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import { normalizePaymentData, isCheckoutRelatedPage } from '@/utils/dataNormalization';
import { processPaymentEvent } from '@/utils/eventDeduplication';

// Modal types enum
export const ModalType = {
  ORDER_SUCCESS: 'ORDER_SUCCESS',
  LOYALTY_ANIMATION: 'LOYALTY_ANIMATION',
  PRESCRIPTION_DELIVERY: 'PRESCRIPTION_DELIVERY',
  PRESCRIPTION_SUCCESS: 'PRESCRIPTION_SUCCESS',
  QUICK_VIEW: 'QUICK_VIEW',
};

// Create context
const ModalContext = createContext({
  activeModal: null,
  modalData: null,
  showModal: () => {},
  hideModal: () => {},
  isModalVisible: () => false,
});

export const ModalProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalQueue, setModalQueue] = useState([]);
  const router = useRouter();

  // Process the next modal in queue when the current one closes
  const processQueue = useCallback(() => {
    if (modalQueue.length > 0 && !activeModal) {
      const nextModal = modalQueue[0];
      setActiveModal(nextModal.type);
      setModalData(nextModal.data);
      setModalQueue(prev => prev.slice(1));
    }
  }, [modalQueue, activeModal]);

  // Show a modal with optional data
  const showModal = useCallback((type, data = null, options = {}) => {
    const { queueIfActive = true, replace = false } = options;

    // If a modal is already active
    if (activeModal) {
      if (replace) {
        // Replace the current modal
        setActiveModal(type);
        setModalData(data);
        // Clear the queue if we're replacing
        setModalQueue([]);
      } else if (queueIfActive) {
        // Queue this modal to show after the current one closes
        setModalQueue(prev => [...prev, { type, data }]);
      }
      // If queueIfActive is false and replace is false, we just ignore the request
    } else {
      // Show immediately if no modal is active
      setActiveModal(type);
      setModalData(data);
    }
  }, [activeModal]);

  // Hide the currently active modal
  const hideModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
    
    // Process next modal in queue in the next tick
    setTimeout(processQueue, 0);
  }, [processQueue]);

  // Check if a specific modal type is visible
  const isModalVisible = useCallback((type) => {
    return activeModal === type;
  }, [activeModal]);

  // Listen for checkout events
  useEffect(() => {
    const handlePaymentCompleted = (data) => {
      console.log('ModalContext: Payment completed event received', data);
      
      // Only show modals on checkout-related pages using centralized utility
      if (!isCheckoutRelatedPage()) {
        console.log('ModalContext: Ignoring payment completed event on non-checkout page');
        return;
      }

      // Use centralized event deduplication
      const wasProcessed = processPaymentEvent(data, (normalizedData) => {
        console.log('ModalContext: Processing payment event with normalized data:', normalizedData);
        
        // Check for loyalty points using normalized data
        const hasLoyaltyPoints = (normalizedData.loyaltyPointsEarned > 0 || normalizedData.pointsEarned > 0);
        
        // Queue the loyalty animation first if applicable
        if (hasLoyaltyPoints || normalizedData.tierUpgrade) {
          showModal(ModalType.LOYALTY_ANIMATION, normalizedData);
        }
        
        // Then queue the order success modal
        showModal(ModalType.ORDER_SUCCESS, normalizedData);
      });

      if (!wasProcessed) {
        console.log('ModalContext: Payment event was duplicate, skipping modal display');
      }
    };

    const handleLoyaltyAnimationComplete = () => {
      console.log('ModalContext: Loyalty animation complete event received');
      // Hide the loyalty animation modal
      if (activeModal === ModalType.LOYALTY_ANIMATION) {
        hideModal(); // This will trigger processQueue to show the next modal
      }
    };

    const handleShowLoyaltyAnimation = (data) => {
      console.log('ModalContext: Show loyalty animation event received', data);
      
      // Only show modals on checkout-related pages using centralized utility
      if (!isCheckoutRelatedPage()) {
        console.log('ModalContext: Ignoring loyalty animation event on non-checkout page');
        return;
      }
      
      // Normalize data using centralized utility
      const normalizedData = normalizePaymentData(data);
      
      showModal(ModalType.LOYALTY_ANIMATION, normalizedData);
    };

    // Subscribe to events
    eventEmitter.on(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
    eventEmitter.on(Events.LOYALTY_ANIMATION_COMPLETE, handleLoyaltyAnimationComplete);
    eventEmitter.on(Events.SHOW_LOYALTY_ANIMATION, handleShowLoyaltyAnimation);

    return () => {
      // Clean up event listeners
      eventEmitter.off(Events.PAYMENT_COMPLETED, handlePaymentCompleted);
      eventEmitter.off(Events.LOYALTY_ANIMATION_COMPLETE, handleLoyaltyAnimationComplete);
      eventEmitter.off(Events.SHOW_LOYALTY_ANIMATION, handleShowLoyaltyAnimation);
    };
  }, [activeModal, showModal, hideModal]);

  // Debug logging for modal state changes
  useEffect(() => {
    console.log('Modal state changed:', { 
      activeModal, 
      hasData: !!modalData,
      queueLength: modalQueue.length 
    });
  }, [activeModal, modalData, modalQueue]);

  const value = {
    activeModal,
    modalData,
    showModal,
    hideModal,
    isModalVisible,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);

export default ModalContext; 