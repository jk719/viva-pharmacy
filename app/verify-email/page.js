// src/app/verify-email/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
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
          toast.success('Email verified! Please set your password.');
          
          const result = await signIn('credentials', {
            email: data.email,
            verificationLogin: 'true',
            redirect: false,
          });

          if (result?.ok) {
            setTimeout(() => router.push('/reset-password'), 1500);
          } else {
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
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center space-y-4">
            {status === 'verifying' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verifying your email</h2>
                <p className="text-gray-500">Please wait while we verify your email address...</p>
                <div className="w-16 h-16 mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}