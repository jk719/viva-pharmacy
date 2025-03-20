'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RewardsPageContent from './RewardsPageContent';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RewardsRoute() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?showLogin=true');
      return;
    }

    if (status === 'authenticated') {
      // Fetch user data
      fetch(`/api/user/profile`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("User profile data:", data);
          setUserData(data); // API returns user data directly, not in a data.user object
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
    } else if (status === 'loading') {
      // Keep loading state true
    }
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Unable to load rewards</h2>
        <p className="text-gray-600 mb-4">There was an issue loading your rewards information.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Return to Home
        </button>
      </div>
    </div>;
  }

  return <RewardsPageContent user={userData} />;
} 