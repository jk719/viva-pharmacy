"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Import our new Zustand store
import useLoyaltyStore from '@/lib/loyalty/loyaltyStore';

const LoyaltyContext = createContext();

/**
 * Compatibility wrapper for the LoyaltyProvider
 * This ensures backwards compatibility while using the new Zustand store internally
 */
export function LoyaltyProvider({ children }) {
  const { data: session } = useSession();
  
  // Get state from the Zustand store
  const {
    userData,
    progressInfo,
    isLoading,
    isInitialized,
    fetchUserData,
    pendingTransactions,
  } = useLoyaltyStore();

  // Compatibility flag for connection status
  const [connectionStatus, setConnectionStatus] = useState("connected");
  
  // Initialize data when session is available
  useEffect(() => {
    if (session?.user?.id && !isInitialized && !isLoading) {
      console.log('[LoyaltyProvider] Initializing with session:', session.user.email);
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
    // Forward the fetchUserData function from the store
    refresh: () => {
      console.log('[LoyaltyProvider] Refresh requested via compatibility layer');
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
    console.warn("useLoyaltyData must be used within a LoyaltyProvider, falling back to direct store access");
    // Fallback to direct store access if used outside provider
    return useLoyaltyStore();
  }
  return ctx;
}
