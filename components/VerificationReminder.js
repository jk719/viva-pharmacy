'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function VerificationReminder() {
  const { data: session } = useSession();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  if (!session || session.user.isVerified) {
    return null;
  }

  const resendVerification = async () => {
    try {
      setResending(true);
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });
      
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mt-4 bg-primary/10 border-l-4 border-primary rounded-r-lg p-4 shadow-sm">
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⚠️</span>
          <p className="text-primary font-medium">
            Please verify your email address
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {!resending ? (
            <button
              onClick={resendVerification}
              className="text-sm px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Resend verification email
            </button>
          ) : (
            <span className="text-sm text-primary-dark">
              Sending...
            </span>
          )}
          
          {message && (
            <p className="text-sm text-primary-dark/80 italic">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}