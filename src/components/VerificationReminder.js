'use client';

import { useState } from 'react';

export default function VerificationReminder({ email }) {
  const [isSending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const resendVerification = async () => {
    setSending(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {/* Warning Icon */}
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your email is not verified. Please verify your email to access all features.
          </p>
          {message && (
            <p className="mt-2 text-sm text-yellow-700">
              {message}
            </p>
          )}
          <div className="mt-4">
            <button
              onClick={resendVerification}
              disabled={isSending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {isSending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}