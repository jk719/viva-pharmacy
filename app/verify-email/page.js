// src/app/verify-email/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        toast.error('No verification token provided');
        router.push('/?showLogin=true');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        
        // Attempt auto-login after verification
        try {
          const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            verificationLogin: 'true'
          });

          if (result?.ok) {
            router.push('/?verification=success');
            toast.success('Email verified and signed in successfully!');
          } else {
            // If auto-login fails, redirect to login
            router.push('/?showLogin=true&message=Email verified successfully. Please log in.');
          }
        } catch (err) {
          console.error('Auto-login error:', err);
          router.push('/?showLogin=true&message=Email verified successfully. Please log in.');
        }
        
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        toast.error(err.message);
        router.push('/?showLogin=true');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Verifying your email...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}