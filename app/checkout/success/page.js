"use client";

import { useEffect, useReducer, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Using the main OrderSuccessModal component, not the temporary fix version
import OrderSuccessModal from '@/components/checkout/OrderSuccessModal';
import LoyaltyBanner from '@/components/loyalty/LoyaltyBanner';
import eventEmitter, { Events } from '@/lib/eventEmitter';

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

  // Key flag to indicate if component is freshly mounted (not from a Next.js client nav)
  const isFirstMount = useRef(true);
  
  // Initialize checkout flow once when component mounts
  // Track if points have been updated in the backend
  useEffect(() => {
    // Helper to persist timing logs in sessionStorage
    const persistTimingLog = (msg) => {
      const logs = JSON.parse(sessionStorage.getItem('checkoutTimingLogs') || '[]');
      logs.push({ time: Date.now(), msg });
      sessionStorage.setItem('checkoutTimingLogs', JSON.stringify(logs));
    };
    
    // Get the estimated points from URL params (client-side calculation)
    const pointsEstimate = searchParams.get('pointsEstimate');
    if (pointsEstimate) {
      const pointsValue = parseInt(pointsEstimate, 10) || 0;
      setDisplayPoints(pointsValue);
      console.log('🔮 Using estimated points for initial display:', pointsValue);
    }
    persistTimingLog('Success page useEffect mount');
    console.log('[TIMING] Success page useEffect mount:', Date.now());
    console.log('🔔 First mount status:', isFirstMount.current ? 'FRESH MOUNT' : 'REMOUNT');
    
    // Only run once
    if (didInitialize.current) return;
    didInitialize.current = true;
    
    // Mark this as no longer a first mount for future renders
    isFirstMount.current = false;
    
    // Check if we should force animation (explicitly requested by PaymentForm)
    const params = new URLSearchParams(window.location.search);
    const shouldAnimate = params.get('animate') === 'true';
    if (shouldAnimate) {
      console.log('🎬 Animation explicitly requested from payment form');
      persistTimingLog('Animation requested from payment form');
    }
    
    // Set a max timeout to show the modal even if animation doesn't complete
    // This is a safety measure to ensure users always see the confirmation
    const MAX_WAIT_TIME = 5000; // 5 seconds max wait time (reduced from 6s)
    animationTimeoutRef.current = setTimeout(() => {
      console.log('⚠️ Animation timeout reached - forcing modal display');
      persistTimingLog('Animation timeout - forcing modal');
      if (!loyaltyAnimationComplete && state.status !== CHECKOUT_STATES.SHOWING_MODAL) {
        setLoyaltyAnimationComplete(true);
        dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
      }
    }, MAX_WAIT_TIME);
    
    // Log the navigation path and current window location for debugging
    console.log('🔍 Success page initialization');
    console.log('🔗 Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    console.log('🔄 Search params available:', searchParams ? 'yes' : 'no');
    
    // Navigation method used (if tracked)
    if (typeof window !== 'undefined') {
      const navMethod = sessionStorage.getItem('navigationMethod');
      if (navMethod) {
        console.log(' Navigation method used:', navMethod);
      }
    }
    
    // First try to get order details from URL parameters
    let orderId = searchParams.get('orderId');
    let points = parseInt(searchParams.get('points') || '0', 10);
    let selectedTime = searchParams.get('selectedTime');
    let deliveryMethod = searchParams.get('deliveryMethod');
    
    // Log what we got from URL params
    console.log(' URL parameters:', { orderId, points, selectedTime, deliveryMethod });
    
    // Check the URL search parameters directly for debugging
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      console.log(' Direct URL search parameters:', Object.fromEntries(urlParams.entries()));
      
      // Get the animation flag from URL or sessionStorage
      const animateFromUrl = urlParams.get('animate') === 'true';
      const animateFromStorage = sessionStorage.getItem('loyaltyAnimationPending') === 'true';
      console.log(' Animation flags:', { animateFromUrl, animateFromStorage });
    }
    
    // If ANY URL parameters are missing, try to get ALL from sessionStorage
    // This ensures we have complete data
    if ((!orderId || !points || points === 0) && typeof window !== 'undefined') {
      try {
        const storedData = sessionStorage.getItem('orderSuccessData');
        if (storedData) {
          const orderData = JSON.parse(storedData);
          console.log(' Retrieved order data from sessionStorage:', orderData);
          
          // Take ALL stored data to ensure consistency
          orderId = orderData.orderId;
          points = parseInt(orderData.points || '0', 10);
          selectedTime = orderData.selectedTime;
          deliveryMethod = orderData.deliveryMethod;
          
          console.log(' Using complete data from sessionStorage:', { orderId, points, selectedTime, deliveryMethod });
        } else {
          console.log(' No data found in sessionStorage');
        }
      } catch (err) {
        console.error(' Error reading from sessionStorage:', err);
      }
    }
    
    console.log(' Success page initializing with params:', {
      orderId,
      points,
      selectedTime,
      deliveryMethod,
      fromUrl: !!searchParams.get('orderId'),
      fromStorage: !searchParams.get('orderId') && !!orderId,
      timestamp: new Date().toISOString()
    });
    
    // Refresh loyalty data with a single optimized call
    const refreshLoyaltyData = async () => {
      const loyaltyFetchStart = Date.now();
      persistTimingLog('Loyalty data fetch START');
      console.log('[TIMING] Loyalty data fetch START:', loyaltyFetchStart);
      try {
        console.log(' Refreshing loyalty data...');
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        
        // Make a single API call with cache busting
        const response = await fetch(`/api/user/profile?nocache=${timestamp}&r=${random}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const loyaltyFetchEnd = Date.now();
          persistTimingLog(`Loyalty data fetch END (duration: ${loyaltyFetchEnd - loyaltyFetchStart} ms)`);
          console.log('[TIMING] Loyalty data fetch END:', loyaltyFetchEnd, 'Duration:', loyaltyFetchEnd - loyaltyFetchStart, 'ms');
          const data = await response.json();
          console.log(' Current loyalty data:', {
            vivaBucks: data?.vivaBucks,
            cumulativePoints: data?.cumulativePoints,
            currentTier: data?.currentTier
          });
          
          // Immediately mark as updated - no need to wait
          setPointsUpdated(true);
          // Update actual points from server when available
          if (data.points) {
            setActualPoints(data.points);
            console.log('✅ Received actual points from server:', data.points);
            // If actual points are significantly different from display points, show a notification
            const displayPointsVal = parseInt(displayPoints, 10) || 0;
            if (Math.abs(data.points - displayPointsVal) > 20) {
              console.log('⚠️ Points discrepancy detected:', 
                { estimated: displayPointsVal, actual: data.points });
            }
          }
          console.log(' Loyalty data refresh completed!');
        }
      } catch (err) {
        console.error('Error refreshing loyalty data:', err);
        // Still mark as updated to avoid blocking the flow
        setPointsUpdated(true);
      }
    };
    
    refreshLoyaltyData();

    // IMPORTANT: Don't redirect automatically if no orderId - show a message instead
    if (!orderId) {
      console.log(' No order ID found, but NOT redirecting automatically');
      dispatch({ 
        type: CHECKOUT_STATES.ERROR, 
        payload: 'No order details found. Please try again or check your order history.'
      });
      return;
    }

    console.log(' Initializing checkout success flow:', {
      orderId,
      points,
      selectedTime,
      deliveryMethod,
      timestamp: new Date().toISOString()
    });
    
    if (orderId && (!state.orderDetails || state.status === CHECKOUT_STATES.INITIALIZING)) {
      try {
        console.log(' Initializing success page with order:', orderId);
        console.log(' Points parameter received:', points);
        
        // Set the order details
        const orderDetails = {
          orderId,
          type: 'ORDER_COMPLETE',
          loyaltyUpdateReceived: true,
          points: data.points || 0,
          // Update the actual points from server
          actualPoints: data.points || 0,
          // If passed in points param, use it for animation
          pointsEarned: parseInt(points, 10) || 0
        };
        
        console.log(' Setting up order details with points:', orderDetails.pointsEarned);

        console.log('    // If we have order details, initialize the animation state machine');
        if (orderDetails) {
          console.log(' Order details loaded, initializing loyalty animation');
          dispatch({ type: CHECKOUT_STATES.READY, payload: orderDetails });
          
          // Force animation when coming from payment (either through URL param or sessionStorage)
          // The ts parameter helps ensure we're getting a fresh page load from payment
          const hasTimestamp = searchParams.get('ts') !== null;
          const animateFromUrl = searchParams.get('animate') === 'true';
          const animateFromStorage = typeof window !== 'undefined' && 
                                    sessionStorage.getItem('loyaltyAnimationPending') === 'true';
          
          // Always animate on a direct page load with the animation flag
          const shouldAnimate = (animateFromUrl && hasTimestamp) || animateFromStorage;
          
          console.log(' Animation decision factors:', { 
            hasTimestamp, 
            animateFromUrl, 
            animateFromStorage,
            shouldAnimate 
          });
          
          // Check if points were earned to determine if animation should be shown
          if (orderDetails.pointsEarned > 0 && shouldAnimate) {
            console.log(' Points earned and animation flag present, showing loyalty animation');
            
            // Clear any lingering animation flags
            if (typeof window !== 'undefined') {
              // We'll clear this flag when animation completes
              const paymentTime = parseInt(sessionStorage.getItem('paymentCompletedAt') || '0', 10);
              const timeSincePayment = Date.now() - paymentTime;
              console.log(` Time since payment completion: ${timeSincePayment}ms`);
            }
            
            // Move to animation state immediately
            dispatch({ type: CHECKOUT_STATES.SHOWING_ANIMATION });
            refreshLoyaltyData();
            
            // Set a fallback timeout to show modal if animation doesn't complete
            animationTimeoutRef.current = setTimeout(() => {
              console.log(' Animation timeout reached, force showing modal');
              if (!loyaltyAnimationComplete) {
                setLoyaltyAnimationComplete(true);
                dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
                // Clear pending animation flag
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('loyaltyAnimationPending');
                }
              }
            }, 5000); // Show modal after 5 seconds max
          } else {
            // No points earned or no animation flag, go directly to modal
            console.log(' No points earned or no animation flag, showing modal directly');
            dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
            // Clear any pending animation flags
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('loyaltyAnimationPending');
            }
          }  
        }
      } catch (err) {
        console.error(' Error initializing success page:', err);
        dispatch({ type: CHECKOUT_STATES.ERROR, payload: 'Error loading order details' });
      }
    } else if (state.status === CHECKOUT_STATES.READY && state.orderDetails) {
      // Already have order details, go directly to modal
      console.log(' Showing success modal for existing order details');
      dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
    }
  }, [searchParams, router]);

  // Effect to listen for loyalty animation completed event
  useEffect(() => {
    // Only set up listeners if in animation state and not already completed
    if (state.status === CHECKOUT_STATES.SHOWING_ANIMATION && !loyaltyAnimationComplete) {
      console.log(' Setting up listener for loyalty animation completion');

      const handleAnimationComplete = (data) => {
        console.log(' Received animation complete event:', data);
        handleLoyaltyAnimationComplete();
      };

      // Add event listener for animation completion
      eventEmitter.on(Events.LOYALTY_ANIMATION_COMPLETE, handleAnimationComplete);
      
      // Check if we're in the correct state but the animation hasn't started
      // This is a safety measure if normal LoyaltyBanner rendering fails
      const checkAnimationStarted = setTimeout(() => {
        console.log(' Checking if animation has started...');
        const animationElement = document.querySelector('[data-testid="loyalty-progress-bar-fill"][data-animate="true"]');
        if (!animationElement && state.status === CHECKOUT_STATES.SHOWING_ANIMATION) {
          console.log(' Animation element not found or not animating, forcing state update');
          // Force re-render of animation banner
          dispatch({ type: CHECKOUT_STATES.SHOWING_ANIMATION }); 
        }
      }, 1000);

      return () => {
        // Remove listener and timeout on cleanup
        eventEmitter.off(Events.LOYALTY_ANIMATION_COMPLETE, handleAnimationComplete);
        clearTimeout(checkAnimationStarted);
      };
    }
  }, [state.status, loyaltyAnimationComplete]);

  // Handle loyalty animation completion
  const handleLoyaltyAnimationComplete = () => {
    // Clear animation timeout since animation completed naturally
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    console.log('🎉 Loyalty animation completed in success page');
    
    // Safety check to prevent duplicate state changes
    if (loyaltyAnimationComplete) {
      console.log('⚠️ Animation already completed, ignoring duplicate call');
      return;
    }
    
    // Log completion for debugging
    persistTimingLog('Animation completed naturally');
    
    // Set state variables and transition to modal state
    setLoyaltyAnimationComplete(true);
    dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
    
    // NOTE: We don't re-emit the LOYALTY_ANIMATION_COMPLETE event here
    // This prevents circular events, as ProgressBar already emits this event
    // and that's what triggers this callback in the first place
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
          {/* Add debug info to ensure we know which key is being used */}
          {console.log(`🔑 Rendering LoyaltyBanner with key timestamp: ${Date.now()}`)}
          <LoyaltyBanner 
            forceAnimation={true} 
            onProgressBarAnimationComplete={handleLoyaltyAnimationComplete}
            key={`loyalty-banner-forced-${Date.now()}`} // Force new component instance with clear name
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
