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
  // No need for SSE initialization here anymore
  // The global connection tracker in RewardAlert.js handles everything

  return (
    <SessionProvider session={session}>
      <SWRConfig value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false
      }}>
        <CartProvider>
          <CategoryProvider>
            {children}
          </CategoryProvider>
        </CartProvider>
      </SWRConfig>
    </SessionProvider>
  );
} 