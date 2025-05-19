import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import eventEmitter, { Events } from '@/lib/eventEmitter';

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
  
  // Helper to check if we're on a checkout-related page
  const isCheckoutRelatedPage = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path.includes('/checkout') || path.includes('/payment') || path === '/';
  }, []);

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
      
      // Only show modals on checkout-related pages
      if (!isCheckoutRelatedPage()) {
        console.log('ModalContext: Ignoring payment completed event on non-checkout page');
        return;
      }
      
      // Check for loyalty points using either field name
      const hasLoyaltyPoints = (data.loyaltyPointsEarned > 0 || data.pointsEarned > 0);
      
      // Normalize data to include both field names for maximum compatibility
      const normalizedData = {
        ...data,
        // Normalize points fields
        loyaltyPointsEarned: data.loyaltyPointsEarned || data.pointsEarned || 0,
        pointsEarned: data.pointsEarned || data.loyaltyPointsEarned || 0,
        // Normalize amount fields
        total: data.total || data.amount || 0,
        amount: data.amount || data.total || 0
      };
      
      // Queue the loyalty animation first if applicable
      if (hasLoyaltyPoints || data.tierUpgrade) {
        showModal(ModalType.LOYALTY_ANIMATION, normalizedData);
      }
      
      // Then queue the order success modal
      showModal(ModalType.ORDER_SUCCESS, normalizedData);
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
      
      // Only show modals on checkout-related pages
      if (!isCheckoutRelatedPage()) {
        console.log('ModalContext: Ignoring loyalty animation event on non-checkout page');
        return;
      }
      
      // Normalize data to include both field names
      const normalizedData = {
        ...data,
        loyaltyPointsEarned: data.loyaltyPointsEarned || data.pointsEarned || 0,
        pointsEarned: data.pointsEarned || data.loyaltyPointsEarned || 0,
        total: data.total || data.amount || 0,
        amount: data.amount || data.total || 0
      };
      
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
      queueLength: modalQueue.length,
      isCheckoutPage: isCheckoutRelatedPage()
    });
  }, [activeModal, modalData, modalQueue, isCheckoutRelatedPage]);
  
  // Clear modals on non-checkout pages
  useEffect(() => {
    if (activeModal && !isCheckoutRelatedPage()) {
      console.log('ModalContext: Clearing modal on non-checkout page');
      // Give a small delay to allow for page transitions
      const timer = setTimeout(() => {
        hideModal();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeModal, hideModal, isCheckoutRelatedPage]);

  const contextValue = {
    activeModal,
    modalData,
    showModal,
    hideModal,
    isModalVisible,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => useContext(ModalContext);

export default ModalContext; 