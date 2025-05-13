'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RewardsPageContent from './RewardsPageContent';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RewardsRoute() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?showLogin=true');
    }
  }, [status, router]);

  // Show loading when session is loading
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  // RewardsPageContent now handles its own loading state and data fetching through useLoyaltyData
  return <RewardsPageContent />;
} 