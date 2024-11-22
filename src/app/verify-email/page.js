'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function VerificationContent() {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update: updateSession } = useSession();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Verification token is missing');
          setStatus('error');
          return;
        }

        console.log('Attempting to verify with token:', token);

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (response.ok && data.success) {
          setStatus('success');
          await updateSession();
          setTimeout(() => {
            router.push('/');
          }, 3000);
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

    verifyEmail();
  }, [searchParams, router, updateSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verifying Your Email
              </h1>
              <div className="animate-pulse text-gray-600">
                Please wait while we verify your email address...
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-3xl font-bold text-green-600 mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-600">
                Your email has been verified successfully. Redirecting you to the homepage...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-3xl font-bold text-red-600 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-4">
                {error || 'The verification link is invalid or has expired.'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingVerification() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading verification...</p>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingVerification />}>
      <VerificationContent />
    </Suspense>
  );
}