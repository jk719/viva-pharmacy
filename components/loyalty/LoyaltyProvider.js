"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Import our new improved Zustand store
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';

const LoyaltyContext = createContext();

/**
 * Compatibility wrapper for the LoyaltyProvider
 * This ensures backwards compatibility while using the new improved Zustand store internally
 * Updated to use the Phase 1 improved store for better reliability
 */
export function LoyaltyProvider({ children }) {
  const { data: session } = useSession();
  
  // Get state from the improved Zustand store
  const {
    userData,
    progressInfo,
    isLoading,
    isInitialized,
    fetchUserData,
    pendingTransactions,
  } = useImprovedLoyaltyStore();

  // Compatibility flag for connection status
  const [connectionStatus, setConnectionStatus] = useState("connected");
  
  // Initialize data when session is available
  useEffect(() => {
    if (session?.user?.id && !isInitialized && !isLoading) {
      console.log('[LoyaltyProvider] Initializing with improved store for session:', session.user.email);
      fetchUserData();
    }
  }, [session, isInitialized, isLoading, fetchUserData]);

  // Create the compatibility layer value object
  const value = {
    userData,
    progressInfo,
    isLoading,
    isInitialized,
    connectionStatus,
    // Forward the fetchUserData function from the improved store
    refresh: () => {
      console.log('[LoyaltyProvider] Refresh requested via compatibility layer (using improved store)');
      return fetchUserData();
    }
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
}

// Keep the same hook API for backwards compatibility
export function useLoyaltyData() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) {
    console.warn("useLoyaltyData must be used within a LoyaltyProvider, falling back to direct improved store access");
    // Fallback to direct improved store access if used outside provider
    return useImprovedLoyaltyStore();
  }
  return ctx;
}
