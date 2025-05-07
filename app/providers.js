'use client';

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { CategoryProvider } from "../context/CategoryContext";
import { AnnouncementProvider } from "../components/context/AnnouncementContext";
import { SWRConfig } from 'swr';
import SSEProvider from '@/components/SSEProvider';
import HeaderHeightAdjuster from '@/components/HeaderHeightAdjuster';
import ToasterProvider from '@/components/ToasterProvider';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { ModalProvider } from '@/context/ModalContext';
import dynamic from 'next/dynamic';

// Modal components loaded dynamically
const OrderSuccessModal = dynamic(() => import('@/components/checkout/OrderSuccessModal'));
const LoyaltyAnimationModal = dynamic(() => import('@/components/checkout/LoyaltyAnimationModal'));
const ModalController = dynamic(() => import('@/components/ModalController'));

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
      <GoogleAnalytics />
      <SWRConfig value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false
      }}>
        <AnnouncementProvider>
          <CategoryProvider>
            <CartProvider>
              <ModalProvider>
                <SSEProvider>
                  <ToasterProvider />
                  {children}
                  <ModalController />
                </SSEProvider>
              </ModalProvider>
            </CartProvider>
          </CategoryProvider>
        </AnnouncementProvider>
      </SWRConfig>
      <HeaderHeightAdjuster />
    </SessionProvider>
  );
} 