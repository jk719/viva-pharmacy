'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';

function VerificationComponent() {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const verificationAttempted = useRef(false);
  const redirectTimeout = useRef(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Verification token is missing');
          setStatus('error');
          return;
        }

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          
          // Sign out first
          await signOut({ redirect: false });
          
          // Set redirect timeout
          redirectTimeout.current = setTimeout(() => {
            window.location.replace('/');
          }, 2000);
        } else {
          setError(data.error || 'Verification failed');
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('An error occurred during verification');
        setStatus('error');
      }
    };

    if (searchParams.get('token')) {
      verifyEmail();
    }

    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, [searchParams]);

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

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-green-600">Email Verified!</h1>
          <p>Your email has been successfully verified.</p>
          <p className="mt-2">Redirecting you to sign in...</p>
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
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
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

// Main component with Suspense boundary
export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingVerification />}>
      <VerificationComponent />
    </Suspense>
  );
}