'use client';

import Navbar from "./Navbar";
import PrescriptionBanner from "./PrescriptionBanner";
import LoyaltyBanner from "./loyalty/LoyaltyBanner";
import { usePathname } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();

  // We'll no longer use this to conditionally hide the LoyaltyBanner on checkout
  // Just keeping it for other potential uses
  const isCheckoutPage = pathname === '/checkout' || pathname?.startsWith('/checkout/');

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white" style={{ zIndex: 'var(--z-header)' }}>
      <div className="w-full flex flex-col">
        <Navbar />
        <PrescriptionBanner />
        {/* Show LoyaltyBanner on all pages now that we have a proper modal system */}
        <LoyaltyBanner />
      </div>
    </header>
  );
} 