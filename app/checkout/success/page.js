"use client";

import { useEffect, useReducer, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderSuccessModal from '@/components/checkout/OrderSuccessModal';
import LoyaltyBanner from '@/components/loyalty/LoyaltyBanner';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Define checkout state machine states
const CHECKOUT_STATES = {
  INITIALIZING: 'initializing',      // Initial state, loading order details
  READY: 'ready',                   // Order details loaded, ready to start animation
  ANIMATING: 'animating',           // Loyalty animation is playing
  ANIMATION_COMPLETE: 'animation_complete', // Animation has finished
  SHOWING_MODAL: 'showing_modal',   // Showing order confirmation modal
  ERROR: 'error'                    // Error state
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
      
    case CHECKOUT_STATES.ANIMATING:
      return { 
        ...state,
        status: CHECKOUT_STATES.ANIMATING,
        animationStartTime: new Date().getTime()
      };
      
    case CHECKOUT_STATES.ANIMATION_COMPLETE:
      return { 
        ...state,
        status: CHECKOUT_STATES.ANIMATION_COMPLETE,
        animationEndTime: new Date().getTime(),
        animationDuration: new Date().getTime() - state.animationStartTime
      };
      
    case CHECKOUT_STATES.SHOWING_MODAL:
      return { 
        ...state,
        status: CHECKOUT_STATES.SHOWING_MODAL 
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
  const didInitialize = useRef(false);
  
  // Initialize state machine with initial state
  const [state, dispatch] = useReducer(checkoutReducer, {
    status: CHECKOUT_STATES.INITIALIZING,
    orderDetails: null,
    animationStartTime: null,
    animationEndTime: null,
    animationDuration: null,
    error: null
  });

  // Initialize checkout flow once when component mounts
  // Track if points have been updated in the backend
  const [pointsUpdated, setPointsUpdated] = useState(false);
  // Track if animation was already forced and if the animation is complete
  const animationForcedRef = useRef(false);
  const animationCompleteRef = useRef(false);

  useEffect(() => {
    // Only run once
    if (didInitialize.current) return;
    didInitialize.current = true;
    
    // Log the navigation path and current window location for debugging
    console.log('📍 Success page initialization');
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔍 Search params available:', searchParams ? 'yes' : 'no');
    
    // Navigation method used (if tracked)
    if (typeof window !== 'undefined') {
      const navMethod = sessionStorage.getItem('navigationMethod');
      if (navMethod) {
        console.log('🧭 Navigation method used:', navMethod);
      }
    }
    
    // First try to get order details from URL parameters
    let orderId = searchParams.get('orderId');
    let points = parseInt(searchParams.get('points') || '0', 10);
    let selectedTime = searchParams.get('selectedTime');
    let deliveryMethod = searchParams.get('deliveryMethod');
    
    // Log what we got from URL params
    console.log('🔗 URL parameters:', { orderId, points, selectedTime, deliveryMethod });
    
    // Check the URL search parameters directly for debugging
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      console.log('🔍 Direct URL search parameters:', Object.fromEntries(urlParams.entries()));
    }
    
    // If ANY URL parameters are missing, try to get ALL from sessionStorage
    // This ensures we have complete data
    if ((!orderId || !points || points === 0) && typeof window !== 'undefined') {
      try {
        const storedData = sessionStorage.getItem('orderSuccessData');
        if (storedData) {
          const orderData = JSON.parse(storedData);
          console.log('📋 Retrieved order data from sessionStorage:', orderData);
          
          // Take ALL stored data to ensure consistency
          orderId = orderData.orderId;
          points = parseInt(orderData.points || '0', 10);
          selectedTime = orderData.selectedTime;
          deliveryMethod = orderData.deliveryMethod;
          
          console.log('📦 Using complete data from sessionStorage:', { orderId, points, selectedTime, deliveryMethod });
        } else {
          console.log('⚠️ No data found in sessionStorage');
        }
      } catch (err) {
        console.error('❌ Error reading from sessionStorage:', err);
      }
    }
    
    console.log('🧾 Success page initializing with params:', {
      orderId,
      points,
      selectedTime,
      deliveryMethod,
      fromUrl: !!searchParams.get('orderId'),
      fromStorage: !searchParams.get('orderId') && !!orderId,
      timestamp: new Date().toISOString()
    });
    
    // Force refresh points data as soon as page loads
    const refreshLoyaltyData = async () => {
      try {
        console.log('🔄 Force refreshing loyalty data before animation...');
        // Force multiple cache-busting requests to ensure fresh data
        for (let i = 0; i < 2; i++) {
          const timestamp = Date.now() + i;
          const random = Math.random().toString(36).substring(2, 15);
          const response = await fetch(`/api/user/profile?nocache=${timestamp}&r=${random}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            cache: 'no-store',
            next: { revalidate: 0 }
          });
          
          if (response.ok) {
            console.log(`✅ Refresh attempt ${i+1} successful`);
            const data = await response.json();
            console.log('📊 Current loyalty data:', {
              vivaBucks: data?.vivaBucks,
              cumulativePoints: data?.cumulativePoints,
              currentTier: data?.currentTier
            });
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        console.log('✅ Loyalty data refresh completed!');
        setPointsUpdated(true);
      } catch (err) {
        console.error('Error refreshing loyalty data:', err);
      }
    };
    
    refreshLoyaltyData();

    // IMPORTANT: Don't redirect automatically if no orderId - show a message instead
    if (!orderId) {
      console.log('⚠️ No order ID found, but NOT redirecting automatically');
      dispatch({ 
        type: CHECKOUT_STATES.ERROR, 
        payload: 'No order details found. Please try again or check your order history.'
      });
      return;
    }

    console.log('📍 Initializing checkout success flow:', {
      orderId,
      points,
      selectedTime,
      deliveryMethod,
      timestamp: new Date().toISOString()
    });
    
    if (orderId && (!state.orderDetails || state.status === CHECKOUT_STATES.INITIALIZING)) {
      try {
        console.log('📥 Initializing success page with order:', orderId);
        console.log('📊 Points parameter received:', points);
        
        // Set the order details
        const orderDetails = {
          orderId,
          deliveryMethod,
          selectedTime,
          // If passed in points param, use it for animation
          pointsEarned: parseInt(points, 10) || 0
        };
        
        console.log('🔆 Setting up order details with points:', orderDetails.pointsEarned);
        
        // First move to READY state with order details
        dispatch({ type: CHECKOUT_STATES.READY, payload: orderDetails });
        
        // Mark animation as forced to ensure progress bar animates
        animationForcedRef.current = true;
        
        // Then use a small delay before starting animation to ensure component updates
        setTimeout(() => {
          console.log('🔴 Starting animation with', orderDetails.pointsEarned, 'points');
          
          // Explicitly emit a loyalty update event to ensure the animation triggers
          if (orderDetails.pointsEarned > 0) {
            eventEmitter.safeEmit(Events.LOYALTY_UPDATE, {
              forceAnimation: true,
              points: orderDetails.pointsEarned,
              timestamp: Date.now()
            });
          }
          
          // Move to animating state
          dispatch({ type: CHECKOUT_STATES.ANIMATING });
          
          // Set a safety fallback timer in case animation callback doesn't fire
          const fallbackTimer = setTimeout(() => {
            if (state.status === CHECKOUT_STATES.ANIMATING && !animationCompleteRef.current) {
              console.log('⏰ Animation safety timeout reached, forcing completion');
              dispatch({ type: CHECKOUT_STATES.ANIMATION_COMPLETE });
              
              // Then show modal after a brief delay
              setTimeout(() => {
                dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
              }, 500);
            }
          }, 8000); // 8 second safety timeout
          
          // If no points to animate, skip directly to complete state
          if (orderDetails.pointsEarned <= 0) {
            console.log('💬 No points to animate, skipping to completion');
            setTimeout(() => {
              dispatch({ type: CHECKOUT_STATES.ANIMATION_COMPLETE });
              
              // Then show modal after a brief delay
              setTimeout(() => {
                dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
              }, 500);
            }, 1000);
          }
        }, 500);
      } catch (err) {
        console.error('❌ Error initializing success page:', err);
        dispatch({ type: CHECKOUT_STATES.ERROR, payload: 'Error loading order details' });
      }
    } else if (state.status === CHECKOUT_STATES.READY && state.orderDetails) {
      // Already have order details but haven't started animating
      console.log('🔴 Triggering animation for existing order details:', state.orderDetails);
      
      // Mark animation as forced to ensure it plays
      animationForcedRef.current = true;
      
      // Emit event to force animation if we have points
      if (state.orderDetails.pointsEarned > 0) {
        eventEmitter.safeEmit(Events.LOYALTY_UPDATE, {
          forceAnimation: true,
          points: state.orderDetails.pointsEarned,
          timestamp: Date.now()
        });
      }
      
      // Move to animating state
      dispatch({ type: CHECKOUT_STATES.ANIMATING });
    }
  }, [searchParams, router]);

  // Monitor state changes and trigger next actions in the flow
  useEffect(() => {
    if (state.status === CHECKOUT_STATES.ANIMATION_COMPLETE) {
      console.log(' Animation complete, showing success modal. Animation duration:', state.animationDuration, 'ms');
      
      // Only proceed if we haven't already shown the modal
      if (state.status !== CHECKOUT_STATES.SHOWING_MODAL) {
        setTimeout(() => {
          console.log(' Transitioning to showing modal state');
          dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
        }, 500); // Small delay for transition
      }
    }
  }, [state.status]);

  // Handle animation completion callback from LoyaltyBanner
  const handleProgressBarAnimationComplete = () => {
    console.log('🎉 Progress bar animation complete callback received');
    
    // Prevent duplicate state transitions
    if (animationCompleteRef.current) {
      console.log('⚠️ Animation already completed, ignoring duplicate callback');
      return;
    }
    
    // Mark as complete
    animationCompleteRef.current = true;
    
    // Transition to animation complete state
    dispatch({ type: CHECKOUT_STATES.ANIMATION_COMPLETE });
    
    // Add a small delay before showing the modal for a better UX
    setTimeout(() => {
      console.log('📱 Transitioning to SHOWING_MODAL state');
      dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
    }, 500);
  };
  
  // Add redundant event listeners for animation completion
  // This ensures we capture the completion even if the direct callback fails
  useEffect(() => {
    // Only set up listeners if we're in the animating state
    if (state.status !== CHECKOUT_STATES.ANIMATING) return;
    
    console.log('📻 Setting up redundant animation completion listeners');
    
    // Listen for custom DOM event from LoyaltyBanner
    const handleDomEvent = (event) => {
      console.log('📡 Received loyalty-animation-complete DOM event', event.detail);
      handleProgressBarAnimationComplete();
    };
    
    // Listen for eventEmitter event from LoyaltyBanner
    const handleEmitterEvent = (data) => {
      console.log('📡 Received LOYALTY_ANIMATION_COMPLETE event', data);
      handleProgressBarAnimationComplete();
    };
    
    // Add both event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('loyalty-animation-complete', handleDomEvent);
      eventEmitter.on(Events.LOYALTY_ANIMATION_COMPLETE, handleEmitterEvent);
    }
    
    // Set a safety timeout to ensure we show the modal eventually
    // even if animation or callbacks fail completely
    const safetyTimer = setTimeout(() => {
      console.log('⏰ Safety timeout: Ensuring animation completion is captured');
      if (state.status === CHECKOUT_STATES.ANIMATING && !animationCompleteRef.current) {
        handleProgressBarAnimationComplete();
      }
    }, 10000); // 10 seconds safety timeout
    
    return () => {
      // Clean up all listeners when effect is cleaned up
      if (typeof window !== 'undefined') {
        window.removeEventListener('loyalty-animation-complete', handleDomEvent);
        eventEmitter.off(Events.LOYALTY_ANIMATION_COMPLETE, handleEmitterEvent);
      }
      clearTimeout(safetyTimer);
    };
  }, [state.status]);

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
      {/* Overlay that blurs everything except the loyalty banner during animation */}
      {state.status === CHECKOUT_STATES.ANIMATING && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 flex flex-col">
          {/* The loyalty banner is not blurred and appears at the top */}
          <div className="w-full z-30">
            <LoyaltyBanner 
              onProgressBarAnimationComplete={handleProgressBarAnimationComplete}
              forceAnimation={true}
              animationPoints={state.orderDetails?.pointsEarned || 0}
              debugMode={true}
              key={`loyalty-banner-${pointsUpdated ? 'updated' : 'initial'}-${state.status}-${state.orderDetails?.pointsEarned || 0}-${Date.now()}`}
            />
          </div>
          
          {/* Center content with prominent message */}
          <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">Your VivaBucks Are Being Updated!</h2>
            <p className="text-white text-lg">Watch your loyalty progress above</p>
            <div className="mt-8 animate-pulse">
              <div className="w-12 h-1 bg-orange-500 rounded-full mb-1 mx-auto"></div>
              <div className="w-8 h-1 bg-orange-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main success page content */}
      <div className={`py-8 transition-opacity duration-500 ${state.status === CHECKOUT_STATES.ANIMATING ? 'opacity-20' : 'opacity-100'}`}>
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
          isOpen={true} 
          orderDetails={state.orderDetails} 
          key={`modal-${state.orderDetails.orderId}-${state.status}`}
        />
      )}
    </div>
  );
}
