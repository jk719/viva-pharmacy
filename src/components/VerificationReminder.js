'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function VerificationReminder() {
  const { data: session, status } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('verificationReminderDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.isVerified) {
      setIsDismissed(true);
      localStorage.setItem('verificationReminderDismissed', 'true');
    }
  }, [session?.user?.isVerified]);

  const handleResendVerification = useCallback(async () => {
    if (isResending) return;

    setIsResending(true);
    const toastId = toast.loading('Sending verification email...');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Verification email sent! Please check your inbox.', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to send verification email', { id: toastId });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to send verification email', { id: toastId });
    } finally {
      setIsResending(false);
    }
  }, [isResending]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('verificationReminderDismissed', 'true');
  };

  if (
    status === 'loading' || 
    !session?.user || 
    session.user.isVerified || 
    isDismissed
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Please verify your email address
              </p>
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className={`mt-2 text-sm text-blue-600 hover:text-blue-500 ${
                  isResending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 text-blue-400 hover:text-blue-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}