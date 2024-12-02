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
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <div className="flex">
        <div className="flex-1">
          <p className="text-yellow-700">
            Please verify your email address. 
            {!resending && (
              <button
                onClick={resendVerification}
                className="ml-2 underline hover:text-yellow-800"
              >
                Resend verification email
              </button>
            )}
          </p>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
}