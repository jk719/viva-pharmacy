'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function VerificationReminder() {
  const { data: session } = useSession();
  const [isVerified, setIsVerified] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const checkVerificationStatus = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/auth/check-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });
      
      const data = await response.json();
      setIsVerified(data.isVerified);
      
      if (data.isVerified) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      checkVerificationStatus();
    }
  }, [session]);

  // Don't render anything if verified or not visible
  if (isVerified || !isVisible || !session?.user) {
    return null;
  }

  return (
    <div className="bg-yellow-100 p-4">
      {/* ... rest of your component ... */}
    </div>
  );
}