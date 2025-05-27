// src/app/verify-email/page.js
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation'; 
// import { verifyEmail } from '@/app/actions/verifyEmailAction';
// import toast from 'react-hot-toast';
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
    console.log('Token from URL (useRouter active):', token); 

    // trackEvent('Email Verification Page Visited', { token: token ? 'present' : 'missing' }); // Stays commented

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please check the link or request a new one.');
      // trackEvent('Email Verification Failed', { reason: 'Token Missing' }); // Stays commented
      return;
    }

    setStatus('validating_token_present'); 
    setMessage(`Token found: ${token}. Further verification logic and analytics are currently disabled.`);

    // const handleVerification = async () => { // Stays commented
    //   try {
    //     // ... (rest of the useEffect logic remains commented)
    //   } catch (error) {
    //     // ...
    //   }
    // };

    // handleVerification(); // Stays commented
  }, [searchParams, router]); 

  const Icon = () => { 
    switch (status) {
      case 'validating':
      case 'validating_token_present': 
        return <ClockIcon className="h-12 w-12 text-blue-500" aria-hidden="true" />;
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
          {status === 'validating' && 'Verifying Email'}
          {status === 'validating_token_present' && 'Token Detected'} 
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Error'}
          {status === 'expired' && 'Token Expired'}
          {status === 'already-verified' && 'Already Verified'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <p className="mt-2 text-xs text-gray-500">Debug: useRouter, Icons active. Server action & analytics still disabled.</p>
        {/* Link components still commented */}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading email verification...</div>}> 
      <VerifyEmailPageContent />
    </Suspense> 
  );
}