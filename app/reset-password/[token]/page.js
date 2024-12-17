'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PasswordStrengthIndicator } from '@/components/auth';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      router.push('/login?message=Password reset successful. Please login with your new password.');
    } catch (err) {
      setError(err.message || 'An error occurred while resetting the password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-600">
            Please enter your new password below
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 border border-red-100"
              >
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                  />
                </div>
                <PasswordStrengthIndicator password={password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm
                             ${confirmPassword && password !== confirmPassword 
                               ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                               : ''}`}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-500"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4
                       rounded-xl text-sm font-medium text-white
                       bg-gradient-to-r from-[#FF9F43] to-[#FFB976]
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link 
            href="/login"
            className="text-sm font-medium text-[#FF9F43] hover:text-[#ff9429]
                     transition-colors duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}