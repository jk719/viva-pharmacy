'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0}>
      <CartProvider>
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
      </CartProvider>
    </SessionProvider>
  );
} 