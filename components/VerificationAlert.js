'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { resendVerificationEmail } from '@/app/actions/auth';

export default function VerificationAlert() {
  const { data: session } = useSession();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const shouldShowAlert = session?.user && 
    !session.user.isVerified && 
    session.user.email !== 'vivajacksonheights@gmail.com';
  
  if (!shouldShowAlert) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setResending(true);
      // Create form data for the server action
      const formData = new FormData();
      formData.append('email', session.user.email);
      
      // Call server action instead of API
      const result = await resendVerificationEmail(formData);
      
      setMessage(result.message);
    } catch (error) {
      setMessage('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 my-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-primary font-medium">
                  Please verify your email address
                </p>
                <p className="text-sm text-gray-600">
                  Check your inbox for the verification link
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!resending ? (
                <button
                  onClick={handleResendVerification}
                  className="text-sm px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Resend verification email
                </button>
              ) : (
                <span className="text-sm text-primary-dark">
                  Sending...
                </span>
              )}
              
              {message && (
                <p className="text-sm text-primary-dark/80 italic">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 