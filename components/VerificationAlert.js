'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function VerificationAlert() {
  const { data: session } = useSession();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const shouldShowAlert = session?.user && !session.user.isVerified;
  
  if (!shouldShowAlert) {
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
    <div className="fixed w-full left-0 top-[100px] md:top-[64px] z-35 bg-white">
      <div className="container mx-auto px-6">
        <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-primary font-medium">
                  Please verify your email address
                </p>
                <p className="text-sm text-gray-600">
                  Check your inbox for the verification link
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
      </div>
    </div>
  );
} 