// src/app/verify-email/page.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Verifying...');
  const token = searchParams.get('token');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    async function verifyEmail() {
      if (!token || verificationAttempted.current) {
        return;
      }

      verificationAttempted.current = true;

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (data.success) {
          setStatus('Email verified successfully! Redirecting...');
          toast.success(
            '✅ Email verified successfully!\n Please login to continue.', 
            {
              duration: 6000,
              style: {
                background: '#003366',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                maxWidth: '500px',
                whiteSpace: 'pre-line'
              },
            }
          );
          await signOut({ redirect: false });
          setTimeout(() => {
            router.push('/?message=Email verified successfully. Please sign in.');
          }, 2000);
        } else {
          setStatus(data.message || 'Verification failed');
          toast.error(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('An error occurred during verification');
        toast.error('An error occurred during verification');
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}