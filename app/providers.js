'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';

// Global fetcher for SWR
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function Providers({ children, session }) {
  console.log('Providers: Initializing');
  
  return (
    <SessionProvider session={session} refetchInterval={20}>
      <SWRConfig 
        value={{
          fetcher,
          revalidateOnFocus: false, // Disable revalidation on window focus
          dedupingInterval: 10000, // Dedupe requests within 10 seconds
          shouldRetryOnError: false, // Disable automatic retries on error
          suspense: false,
          fallback: {
            '/api/products': { products: [] }
          }
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
                success: {
                  iconTheme: {
                    primary: 'white',
                    secondary: '#003366',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'white',
                    secondary: '#003366',
                  },
                },
              }}
            />
          </CategoryProvider>
        </CartProvider>
      </SWRConfig>
    </SessionProvider>
  );
} 