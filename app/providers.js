'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import dynamic from 'next/dynamic';

// Dynamically import SSEProvider with no SSR
const SSEProvider = dynamic(() => import('@/components/SSEProvider'), {
  ssr: false,
  loading: () => null
});

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session} refetchInterval={0}>
      <SWRConfig value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false
      }}>
        <CategoryProvider>
          <CartProvider>
            <SSEProvider>
              {children}
            </SSEProvider>
          </CartProvider>
        </CategoryProvider>
      </SWRConfig>
    </SessionProvider>
  );
} 