"use client";

import { useEffect, useReducer, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderSuccessModal from '@/components/checkout/OrderSuccessModal';
import eventEmitter, { Events } from '@/lib/eventEmitter';

// Define checkout state machine states - simplified without animation states
const CHECKOUT_STATES = {
  INITIALIZING: 'initializing',      // Initial state, loading order details
  READY: 'ready',                   // Order details loaded
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
    error: null
  });

  // Initialize checkout flow once when component mounts
  // Track if points have been updated in the backend
  const [pointsUpdated, setPointsUpdated] = useState(false);
  // No longer tracking animation completion

  useEffect(() => {
    // Helper to persist timing logs in sessionStorage
    const persistTimingLog = (msg) => {
      const logs = JSON.parse(sessionStorage.getItem('checkoutTimingLogs') || '[]');
      logs.push({ time: Date.now(), msg });
      sessionStorage.setItem('checkoutTimingLogs', JSON.stringify(logs));
    };
    persistTimingLog('Success page useEffect mount');
    console.log('[TIMING] Success page useEffect mount:', Date.now());
    // Only run once
    if (didInitialize.current) return;
    didInitialize.current = true;
    
    // Log the navigation path and current window location for debugging
    console.log(' Success page initialization');
    console.log(' Current URL:', window.location.href);
    console.log(' Search params available:', searchParams ? 'yes' : 'no');
    
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
          console.log('✅ Loyalty data refresh completed!');
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
        
        // Move directly to READY state with order details then show modal
        dispatch({ type: CHECKOUT_STATES.READY, payload: orderDetails });
        
        // Show modal immediately without delay
        console.log('📱 Showing success modal directly without animation');
        dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
      } catch (err) {
        console.error('❌ Error initializing success page:', err);
        dispatch({ type: CHECKOUT_STATES.ERROR, payload: 'Error loading order details' });
      }
    } else if (state.status === CHECKOUT_STATES.READY && state.orderDetails) {
      // Already have order details, go directly to modal
      console.log('📱 Showing success modal for existing order details');
      dispatch({ type: CHECKOUT_STATES.SHOWING_MODAL });
    }
  }, [searchParams, router]);

  // No animation state monitoring or callbacks needed

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
          isOpen={true} 
          orderDetails={state.orderDetails} 
          key={`modal-${state.orderDetails.orderId}-${state.status}`}
        />
      )}
    </div>
  );
}
