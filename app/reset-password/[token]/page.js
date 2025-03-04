'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';

export default function ResetPasswordWithToken() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting password reset with token:', token?.substring(0, 10) + '...');

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Skip verification check and directly reset password
      const response = await fetch('/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          password,
          isManagerReset: true
        }),
      });

      const data = await response.json();
      console.log('Password reset response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to reset password');
      }

      toast.success('Password set successfully!');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/?showLogin=true');
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message);
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
            Back to home
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Set your password
          </h2>
          <p className="text-sm text-gray-600">
            Please set a secure password for your account
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                           text-gray-900 placeholder-gray-400 
                           focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                           transition duration-150
                           bg-gray-50/30 focus:bg-white sm:text-sm"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                           text-gray-900 placeholder-gray-400 
                           focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                           transition duration-150
                           bg-gray-50/30 focus:bg-white sm:text-sm"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <div className="w-5 h-5">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </div>
                  <span>Setting Password...</span>
                </div>
              ) : (
                'Set Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}