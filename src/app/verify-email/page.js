// src/app/verify-email/page.js
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

function VerificationComponent() {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationAttempted.current) return;
      
      const token = searchParams.get('token');
      if (!token) {
        setError('Verification token is missing');
        setStatus('error');
        return;
      }

      try {
        console.log('Starting verification with token:', token);
        verificationAttempted.current = true;

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (response.ok && data.success) {
          // Sign out to force session refresh
          await signOut({ redirect: false });
          setStatus('success');
        } else {
          throw new Error(data.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message || 'An error occurred during verification');
        setStatus('error');
      }
    };

    if (searchParams.get('token') && !verificationAttempted.current) {
      verifyEmail();
    }
  }, [searchParams]);

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-semibold mb-4 text-green-600">Email Verified Successfully!</h1>
          <p className="text-gray-600 mb-6">Your email has been verified. Please sign in again to continue using your account.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Verifying your email...</h1>
          <p>Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Verification Failed</h1>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            router.push('/');
            router.refresh();
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingVerification />}>
      <VerificationComponent />
    </Suspense>
  );
}

function LoadingVerification() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
        <p>Please wait while we prepare the verification process.</p>
      </div>
    </div>
  );
}