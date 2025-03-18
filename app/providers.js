'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { AnnouncementProvider } from "../components/context/AnnouncementContext";
import { SWRConfig } from 'swr';
import SSEProvider from '@/components/SSEProvider';

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
        <AnnouncementProvider>
          <CategoryProvider>
            <CartProvider>
              <SSEProvider>
                {children}
              </SSEProvider>
            </CartProvider>
          </CategoryProvider>
        </AnnouncementProvider>
      </SWRConfig>
    </SessionProvider>
  );
} 