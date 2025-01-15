// src/app/verify-email/page.js
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      console.log('Starting verification process with token:', token?.substring(0, 10) + '...');

      if (!token) {
        setStatus('error');
        setError('No verification token provided');
        setTimeout(() => {
          router.push('/login?error=' + encodeURIComponent('No verification token provided'));
        }, 2000);
        return;
      }

      try {
        // Step 1: Verify the email
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        
        // Step 2: Attempt auto-login
        console.log('Attempting auto-login for:', data.email);
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: data.email,
          verificationLogin: 'true'
        });

        console.log('Auto-login result:', signInResult);

        if (signInResult?.ok) {
          console.log('Auto-login successful, redirecting...');
          router.push('/?message=Welcome! Your email has been verified.');
          router.refresh();
        } else {
          console.log('Auto-login failed, redirecting to login...');
          router.push(`/login?verification=success&email=${encodeURIComponent(data.email)}`);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setError(err.message);
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(err.message)}`);
        }, 2000);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-4">
            {status === 'verifying' && (
              <div className="text-center text-gray-600">
                <div className="animate-pulse">Verifying your email address...</div>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center text-green-600">
                <div className="animate-bounce">✓</div>
                Email verified successfully! Logging you in...
              </div>
            )}
            {status === 'error' && (
              <div className="text-center text-red-600">
                <div className="animate-bounce">✗</div>
                {error || 'Verification failed'}
                <p className="mt-2 text-sm">Redirecting to login page...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}