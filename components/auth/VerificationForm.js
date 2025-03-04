'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function VerificationForm({ token }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const verifyEmail = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      toast.success('Email verified successfully!');

      // If this is a manager, handle auto-login
      if (data.userRole === 'MANAGER') {
        const signInResult = await signIn('credentials', {
          email: data.email,
          verificationLogin: 'true',
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push('/reset-password');
        } else {
          toast.error('Auto-login failed. Please try logging in manually.');
          router.push('/?showLogin=true');
        }
      } else {
        router.push('/?verification=success');
      }
    } catch (error) {
      toast.error(error.message || 'Verification failed');
      router.push('/');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Click below to verify your email address
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={verifyEmail}
            disabled={isVerifying}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isVerifying ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
