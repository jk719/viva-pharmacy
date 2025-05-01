'use client';

import Navbar from "./Navbar";
import PrescriptionBanner from "./PrescriptionBanner";
import LoyaltyBanner from "./loyalty/LoyaltyBanner";
import { usePathname } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();

  const isCheckoutPage = pathname === '/checkout' || pathname?.startsWith('/checkout/');

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white z-50">
      <div className="w-full flex flex-col">
        <Navbar />
        <PrescriptionBanner />
        {!isCheckoutPage && <LoyaltyBanner />}
      </div>
    </header>
  );
} 