// src/app/verify-email/page.js
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; 
import { verifyEmail } from '@/app/actions/verifyEmailAction'; 
import toast from 'react-hot-toast'; 
// import { trackEvent } from '@/lib/analytics';
// import { useSession } from 'next-auth/react';
// import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon, ClockIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; 
// import LoadingSpinner from '@/components/ui/LoadingSpinner'; 

function VerifyEmailPageContent() {
  const searchParams = useSearchParams(); 
  const router = useRouter(); 
  const [status, setStatus] = useState('validating'); 
  const [message, setMessage] = useState('Verifying your email address, please wait...'); 
  // const { data: session, status: sessionStatus } = useSession(); 

  useEffect(() => { 
    const token = searchParams ? searchParams.get('token') : null; 
    console.log('Token from URL (verifyEmail active):', token); 

    // trackEvent('Email Verification Page Visited', { token: token ? 'present' : 'missing' }); // Stays commented

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please check the link or request a new one.');
      toast.error('Verification token is missing.'); 
      // trackEvent('Email Verification Failed', { reason: 'Token Missing' }); // Stays commented
      return;
    }

    const handleVerification = async () => { 
      setStatus('validating');
      setMessage('Verifying your email, please stand by...');
      // trackEvent('Email Verification Started', { token }); // Stays commented
      try {
        const result = await verifyEmail({ token }); 
        // console.log('Verification result:', result); // Optional: for debugging the result object

        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Your email has been successfully verified. You can now log in.');
          toast.success(result.message || 'Email verified successfully!'); 
          // trackEvent('Email Verification Succeeded', { token }); // Stays commented
          // setTimeout(() => router.push('/auth/login?verified=true'), 3000); // Keep commented for now
        } else {
          // Determine specific error status based on result.errorType or message
          if (result.errorType === 'ALREADY_VERIFIED') {
            setStatus('already-verified');
          } else if (result.errorType === 'EXPIRED_TOKEN' || result.errorType === 'INVALID_TOKEN') {
            setStatus('expired'); // Or 'error' if you prefer a general error for invalid/expired
          } else {
            setStatus('error');
          }
          setMessage(result.message || 'An error occurred during verification.');
          toast.error(result.message || 'Verification failed.'); 
          // trackEvent('Email Verification Failed', { token, reason: result.message, errorType: result.errorType }); // Stays commented
        }
      } catch (error) {
        // console.error('Verification process error:', error); // Optional for debugging
        setStatus('error');
        setMessage('A critical error occurred. Please try again later or contact support.');
        toast.error('A critical error occurred during email verification.'); 
        // trackEvent('Email Verification Exception', { token, errorMessage: error.message }); // Stays commented
      }
    };

    handleVerification(); 
  }, [searchParams, router]); 

  const Icon = () => { 
    switch (status) {
      case 'validating':
        return <ClockIcon className="h-12 w-12 text-blue-500 animate-spin" aria-hidden="true" />; 
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-green-500" aria-hidden="true" />;
      case 'error':
      case 'expired':
        return <XCircleIcon className="h-12 w-12 text-red-500" aria-hidden="true" />;
      case 'already-verified':
        return <QuestionMarkCircleIcon className="h-12 w-12 text-yellow-500" aria-hidden="true" />;
      default: 
        return <ClockIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <Icon /> 
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {status === 'validating' && 'Verifying Your Email...'}
          {status === 'success' && 'Email Successfully Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'expired' && 'Token Invalid or Expired'}
          {status === 'already-verified' && 'Email Already Verified'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <p className="mt-2 text-xs text-gray-500">Debug: Server action & toast active. Analytics & session still disabled.</p>
        {/* Link components & automatic redirect still commented */}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><ClockIcon className="h-12 w-12 text-blue-500 animate-spin" /> Loading...</div>}> 
      <VerifyEmailPageContent />
    </Suspense> 
  );
}