'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function VerificationReminder() {
  const { data: session, update: updateSession } = useSession();

  // Function to handle resending verification email
  const handleResendVerification = useCallback(async (toastId) => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for session handling
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Verification email sent!');
      } else {
        toast.error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to send verification email');
    } finally {
      toast.dismiss(toastId);
    }
  }, []);

  // Check verification status periodically
  useEffect(() => {
    let intervalId;
    let toastId;

    const checkVerification = async () => {
      if (session?.user && !session.user.isVerified) {
        try {
          const response = await fetch('/api/auth/check-verification', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Important for session handling
          });
          
          if (!response.ok) {
            throw new Error('Verification check failed');
          }

          const data = await response.json();
          
          if (data.isVerified) {
            // User is verified, update session and dismiss toast
            await updateSession();
            toast.dismiss(toastId);
            toast.success('Email verified successfully!');
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Verification check failed:', error);
          // Don't show error to user, just log it
        }
      } else if (session?.user?.isVerified) {
        // If user is already verified, clean up
        clearInterval(intervalId);
        if (toastId) toast.dismiss(toastId);
      }
    };

    if (session?.user && !session.user.isVerified) {
      // Show the verification reminder toast
      toastId = toast(
        (t) => (
          <div className="flex flex-col">
            <p className="font-medium">Please verify your email address</p>
            <button
              onClick={() => handleResendVerification(t.id)}
              className="px-3 py-1.5 mt-2 text-sm bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors"
            >
              Resend verification email
            </button>
          </div>
        ),
        {
          duration: Infinity,
          position: 'bottom-right',
          icon: '⚠️',
          style: {
            background: '#003366',
            color: '#fff',
            padding: '16px',
          },
        }
      );

      // Check verification status every 30 seconds
      intervalId = setInterval(checkVerification, 30000);
      
      // Initial check
      checkVerification();
    }

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (toastId) toast.dismiss(toastId);
    };
  }, [session, handleResendVerification, updateSession]);

  return null;
}