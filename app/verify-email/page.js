// src/app/verify-email/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { verifyEmail } from '@/app/actions/auth';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('verifying');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        console.log('Starting verification with token:', token?.substring(0, 10) + '...');
        
        // Create form data
        const formData = new FormData();
        formData.append('token', token);
        
        const result = await verifyEmail(formData);

        if (!result.success) {
          throw new Error(result.message || 'Verification failed');
        }

        setStatus('success');
        toast.success('Email verified successfully');

        // For managers who need to set password
        if (result.role === 'MANAGER' && result.mustChangePassword) {
          console.log('Redirecting manager to password setup:', token);
          router.replace(`/reset-password/${token}`);
          return;
        }

        // For regular users, redirect home
        console.log('Redirecting to home');
        router.replace('/?verification=success');

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        toast.error(error.message || 'Verification failed');
      }
    };

    if (token) {
      handleVerification();
    } else {
      setStatus('invalid');
    }
  }, [token, router]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
            <p className="text-gray-600">Redirecting you to login...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <p className="text-gray-600">Please try again or contact support.</p>
          </div>
        );
      case 'invalid':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Invalid Token</h2>
            <p className="text-gray-600">The verification link appears to be invalid.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {renderContent()}
      </div>
    </div>
  );
}