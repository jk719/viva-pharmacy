'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import { useEffect } from 'react';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function Providers({ children, session }) {
  // Cleanup effect for SSE connections
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        // Close any existing EventSource connections
        const closeSSEConnections = () => {
          const sources = Array.from(document.getElementsByTagName('*'))
            .filter(element => element._eventSource)
            .map(element => element._eventSource);
          
          sources.forEach(source => {
            if (source && source.close) {
              source.close();
            }
          });
        };
        
        closeSSEConnections();
      }
    };
  }, []);

  return (
    <SessionProvider 
      session={session} 
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <SWRConfig 
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 10000,
          shouldRetryOnError: false,
          errorRetryCount: 2,
          suspense: false
        }}
      >
        <CartProvider>
          <CategoryProvider>
            {children}
            <Toaster
              position="top-center"
              containerStyle={{
                top: '80px',
                zIndex: 10000
              }}
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#003366',
                  color: '#fff',
                  padding: '16px',
                  fontSize: '16px',
                  maxWidth: '90vw',
                  textAlign: 'center',
                  zIndex: 10000,
                },
              }}
            />
          </CategoryProvider>
        </CartProvider>
      </SWRConfig>
    </SessionProvider>
  );
} 