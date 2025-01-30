// src/app/verify-email/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const [status, setStatus] = useState('verifying');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        toast.error('No verification token provided');
        setTimeout(() => router.push('/'), 1500);
        return;
      }

      try {
        console.log('Starting verification with token:', token);

        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        setStatus('success');
        
        if (data.userRole === 'MANAGER' && data.mustChangePassword) {
          console.log('Manager verification successful, proceeding to login');
          toast.success('Email verified! Please set your password.');
          
          const result = await signIn('credentials', {
            email: data.email,
            verificationLogin: 'true',
            redirect: false,
          });

          console.log('Sign in result:', result);

          if (result?.ok) {
            console.log('Login successful, redirecting to password reset');
            setTimeout(() => {
              router.push('/reset-password');
            }, 1500);
          } else {
            console.error('Login failed:', result?.error);
            toast.error('Auto-login failed. Please try logging in manually.');
            setTimeout(() => router.push('/?showLogin=true'), 1500);
          }
        } else {
          toast.success('Email verified! Please sign in.');
          setTimeout(() => router.push('/?verification=success'), 1500);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        toast.error(err.message);
        setTimeout(() => router.push('/'), 1500);
      }
    };

    verifyToken();
  }, [isClient, searchParams, router]);

  const loadingSpinner = (
    <div className="w-16 h-16 mx-auto">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent" />
    </div>
  );

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {loadingSpinner}
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              {loadingSpinner}
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaEnvelope className="text-2xl text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Email Verified!</h3>
                <p className="text-sm text-gray-600">Redirecting you...</p>
              </div>
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <FaEnvelope className="text-2xl text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Verification Failed</h3>
                <p className="text-sm text-gray-600">Redirecting to home page...</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <VerifyEmailContent />;
}