'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center space-y-2 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4
                     transition-colors duration-200"
          >
            <FaArrowLeft className="text-xs" />
            Back to login
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaEnvelope className="text-2xl text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
                <p className="text-sm text-gray-600">
                  We've sent a password reset link to {email}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
              >
                Return to login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
                >
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                             transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 
                         bg-gradient-to-r from-[#FF9F43] to-[#FFB976]
                         text-white text-sm font-medium rounded-xl
                         hover:from-[#ff9429] hover:to-[#ffa851]
                         focus:outline-none focus:ring-2 focus:ring-offset-2
                         focus:ring-orange-500 transition-all duration-200
                         shadow-lg shadow-orange-200/50
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
          <div className="animate-pulse max-w-md w-full space-y-8 p-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
