'use client';

import Navbar from "./Navbar";
import LoyaltyBanner from "./loyalty/LoyaltyBanner";

export default function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white z-50">
      <div className="w-full">
        <Navbar />
        <LoyaltyBanner />
      </div>
    </header>
  );
} 