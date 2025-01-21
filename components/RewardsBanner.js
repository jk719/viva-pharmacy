"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaStar, FaCoins, FaGift } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';

export default function RewardsBanner({ variant = 'default' }) {
  const { data: session } = useSession();

  // If user is logged in, show their rewards status
  if (session) {
    return (
      <div className="w-full bg-white border-b">
        <div className="w-full max-w-7xl mx-auto px-4 py-2">
          {/* Existing logged-in user banner code */}
          {/* ... VivaBucks balance, status, available rewards ... */}
        </div>
      </div>
    );
  }

  // If user is not logged in, show join prompt
  return (
    <div className="w-full bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-4 py-2">
        {/* Existing join prompt banner code */}
        {/* ... Join & Get, Welcome Bonus ... */}
      </div>
    </div>
  );
} 