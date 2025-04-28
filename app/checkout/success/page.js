"use client";

import { useEffect, useReducer, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderSuccessModal from '@/components/checkout/OrderSuccessModal';
import LoyaltyBanner from '@/components/loyalty/LoyaltyBanner';
import eventEmitter, { Events } from '@/lib/eventEmitter';
import checkoutService from '@/lib/checkout/checkoutService';

// Define checkout state machine states with animation states
const CHECKOUT_STATES = {
  INITIALIZING: 'initializing',        // Initial state, loading order details
  READY: 'ready',                     // Order details loaded
  SHOWING_ANIMATION: 'showing_animation', // Showing loyalty animation
  SHOWING_MODAL: 'showing_modal',     // Showing order confirmation modal
  ERROR: 'error'                      // Error state
};

// State machine reducer function
function checkoutReducer(state, action) {
  console.log('🔄 State transition:', { from: state.status, to: action.type, payload: action.payload });
  
  switch (action.type) {
    case CHECKOUT_STATES.INITIALIZING:
      return { 
        ...state,
        status: CHECKOUT_STATES.INITIALIZING
      };
      
    case CHECKOUT_STATES.READY:
      return { 
        ...state,
        status: CHECKOUT_STATES.READY, 
        orderDetails: action.payload
      };
    
    case CHECKOUT_STATES.SHOWING_ANIMATION:
      return {
        ...state,
        status: CHECKOUT_STATES.SHOWING_ANIMATION,
        showingLoyaltyAnimation: true
      };
      
    case CHECKOUT_STATES.SHOWING_MODAL:
      return { 
        ...state,
        status: CHECKOUT_STATES.SHOWING_MODAL,
        showingLoyaltyAnimation: false
      };
      
    case CHECKOUT_STATES.ERROR:
      return { 
        ...state,
        status: CHECKOUT_STATES.ERROR, 
        error: action.payload 
      };
      
    default:
      console.error('Unknown action type:', action.type);
      return state;
  }
}

// Helper function to persist timing logs in sessionStorage
const persistTimingLog = (msg) => {
  if (typeof window === 'undefined') return;
  
  const logs = JSON.parse(sessionStorage.getItem('checkoutTimingLogs') || '[]');
  logs.push({ time: Date.now(), msg });
  sessionStorage.setItem('checkoutTimingLogs', JSON.stringify(logs));
};

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pointsUpdated, setPointsUpdated] = useState(false);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [actualPoints, setActualPoints] = useState(null); // Will be populated from server
  const [loyaltyAnimationComplete, setLoyaltyAnimationComplete] = useState(false);
  const didInitialize = useRef(false);
  const animationTimeoutRef = useRef(null);
  
  // Initialize state machine
  const [state, dispatch] = useReducer(checkoutReducer, {
    status: CHECKOUT_STATES.INITIALIZING,
    orderDetails: null,
    error: null,
    showingLoyaltyAnimation: false
  });

  // Key flag to indicate if component is freshly mounted
  const isFirstMount = useRef(true);
  
  // Initialize checkout flow once when component mounts
  useEffect(() => {
    // Log timing data
    const timestamp = Date.now();
    console.log('[TIMING] Success page mounted:', timestamp);
    
    // Only run initialization once
    if (didInitialize.current) return;
    didInitialize.current = true;
    
    // Get orderId and other parameters from URL
    const orderId = searchParams.get('orderId');
    const hasError = searchParams.get('error') === 'true';
    const skipAnimation = searchParams.get('animate') === 'false'; // Check if animation was already shown
    
    // Handle error cases
    if (hasError) {
      dispatch({
        type: CHECKOUT_STATES.ERROR,
        payload: 'There was an issue processing your order'
      });
      return;
    }
    
    if (!orderId) {
      dispatch({
        type: CHECKOUT_STATES.ERROR,
        payload: 'Missing order ID. Unable to display order details.'
      });
      return;
    }
    
    // Use checkout service to get order data from a single source of truth
    const orderData = checkoutService.getStoredOrderData();
    console.log('📦 Retrieved order data:', orderData);
    
    if (orderData && orderData.pointsEstimate) {
      // Set display points for immediate feedback
      setDisplayPoints(orderData.pointsEstimate);
      console.log('🔮 Using estimated points:', orderData.pointsEstimate);
    }
    
    // Use the order details we extracted or create minimal data if needed
    const finalOrderDetails = orderData || { orderId, items: [] };
    
    // Set order details in state
    dispatch({ type: CHECKOUT_STATES.READY, payload: finalOrderDetails });
    
    // Check if we should skip animation (already shown in PaymentForm)
    const params = new URLSearchParams(window.location.search);
    const shouldAnimate = params.get('animate') !== 'false';
    
    if (!shouldAnimate) {
      console.log('⏭️ Skipping animation as it was already shown in PaymentForm');
      // Go directly to modal state since animation was already shown
      dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
    } else {
      console.log('🎬 Starting loyalty animation sequence');
      
      // Start animation timer for safety fallback
      // This ensures that we eventually show the modal even if animation logic fails
      const MAX_WAIT_TIME = 8000; // 8 seconds max wait time
      animationTimeoutRef.current = setTimeout(() => {
        console.log('⌛ Animation timeout reached! Forcing modal display');
        persistTimingLog('Animation timeout - forcing modal');
        if (!loyaltyAnimationComplete && state.status !== CHECKOUT_STATES.SHOWING_MODAL) {
          setLoyaltyAnimationComplete(true);
          dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
        }
      }, MAX_WAIT_TIME);
      
      // Show loyalty animation with a small delay to ensure state is processed
      setTimeout(() => {
        dispatch({ type: CHECKOUT_STATES.SHOWING_ANIMATION });
      }, 100);
    }
    
    // Fetch latest loyalty data from server
    refreshLoyaltyData(orderId);
  }, [searchParams, dispatch, setDisplayPoints, setPointsUpdated]);

  // Refresh loyalty data from server
  const refreshLoyaltyData = async (orderId) => {
    try {
      console.log('♻️ Refreshing loyalty data from server');
      const timestamp = Date.now();
      const cacheKey = Math.random().toString(36).substring(2, 10);
      
      // Fetch user profile with points data
      const response = await fetch(`/api/user/profile?nocache=${timestamp}&key=${cacheKey}`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loyalty data retrieved:', {
          vivaBucks: data?.vivaBucks,
          tier: data?.currentTier
        });
        
        // Mark points as updated
        setPointsUpdated(true);
        
        // Set actual points if available
        if (data.vivaBucks) {
          setActualPoints(data.vivaBucks);
        }
      }
    } catch (err) {
      console.error('Error refreshing loyalty data:', err);
      // Continue with estimated points if actual points can't be fetched
      setPointsUpdated(true);
    }
  };

  // Set up event listener for animation completion
  useEffect(() => {
    // Only set up if we're in animation state and animation isn't complete
    if (state.status === CHECKOUT_STATES.SHOWING_ANIMATION && !loyaltyAnimationComplete) {
      console.log('🔔 Setting up animation completion listener');
      
      // Handle event emitted when animation completes
      const handleAnimationCompleteEvent = (eventData) => {
        console.log('🎉 Animation complete event received:', eventData);
        handleLoyaltyAnimationComplete();
      };
      
      // Add event listener
      eventEmitter.on(Events.LOYALTY_ANIMATION_COMPLETE, handleAnimationCompleteEvent);
      
      // Safety timeout - show modal if animation takes too long
      const safetyTimeout = setTimeout(() => {
        if (!loyaltyAnimationComplete) {
          console.log('⚠️ Animation timeout reached - showing modal');
          handleLoyaltyAnimationComplete();
        }
      }, 5000); // 5 second safety
      
      // Cleanup on unmount or state change
      return () => {
        eventEmitter.off(Events.LOYALTY_ANIMATION_COMPLETE, handleAnimationCompleteEvent);
        clearTimeout(safetyTimeout);
      };
    }
  }, [state.status, loyaltyAnimationComplete]);

  // Handle loyalty animation completion
  const handleLoyaltyAnimationComplete = () => {
    console.log('🎊 Loyalty animation complete - transitioning to modal');
    
    // Clear any pending timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Mark animation as complete
    setLoyaltyAnimationComplete(true);
    
    // Show the order confirmation modal after a short delay
    setTimeout(() => {
      dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
      
      // Emit completion event (helpful for testing/debugging)
      eventEmitter.emit(Events.LOYALTY_ANIMATION_COMPLETE, {
        timestamp: Date.now(),
        completed: true
      });
    }, 300);
    
    // Log completion for debugging
    persistTimingLog('Animation completed');
  };
  
  // Effect to cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Render loading state while initializing
  if (state.status === CHECKOUT_STATES.INITIALIZING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  // Render error state if there's an error
  if (state.status === CHECKOUT_STATES.ERROR) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="text-red-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{state.error || 'Unable to process your order confirmation'}</p>
        <button 
          onClick={() => router.push('/')} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main success page content */}
      {/* Loyalty Banner - Only shown during SHOWING_ANIMATION state */}
      {state.status === CHECKOUT_STATES.SHOWING_ANIMATION && state.orderDetails && (
        <div className="loyalty-animation-container mb-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {actualPoints ? (
                <span>You earned {actualPoints} VivaBucks!</span>
              ) : displayPoints > 0 ? (
                <span>You earned approximately {displayPoints} VivaBucks!</span>
              ) : (
                <span>Processing your reward points...</span>
              )}
            </h3>
          </div>
          {/* Add debug info to ensure proper rendering */}
          {console.log(`🔑 Rendering LoyaltyBanner with forceAnimation=true`)}
          <LoyaltyBanner 
            forceAnimation={true} /* Force animation based on previous debugging */
            onProgressBarAnimationComplete={handleLoyaltyAnimationComplete}
            key={`loyalty-banner-forced-${Date.now()}`} /* Force new instance */
          />
        </div>
      )}
      
      <div className="py-8">
        <div className="text-center mb-8">
          <div className="mb-4 text-green-500">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Order is Confirmed!</h1>
          <p className="text-gray-600">
            Thanks for your purchase! We'll send a confirmation email shortly.
          </p>
        </div>
      </div>

      {/* Show the modal only in the SHOWING_MODAL state */}
      {state.status === CHECKOUT_STATES.SHOWING_MODAL && state.orderDetails && (
        <OrderSuccessModal 
          orderDetails={state.orderDetails} 
          onClose={() => router.push('/')} 
          key={`modal-${state.orderDetails.orderId}-${state.status}`}
        />
      )}
    </div>
  );
}
