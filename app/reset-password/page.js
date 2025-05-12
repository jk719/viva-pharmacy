'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { resetPassword } from '@/app/actions/auth';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  useEffect(() => {
    if (session?.user && !session.user.mustChangePassword) {
      router.push('/');
      toast.error('Unauthorized access');
    }
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting password reset process...');
      
      // Use the reset token from the session user if available
      const token = session?.user?.resetToken || '';
      
      // Create form data for the server action
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', password);
      
      // Use server action instead of API
      const result = await resetPassword(formData);

      if (!result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }

      setSuccess(true);
      toast.success('Password updated successfully!');

      // Sign out first
      console.log('Signing out current session...');
      await signOut({ redirect: false });

      // Sign in with new credentials
      console.log('Attempting sign in with new credentials...');
      const signInResult = await signIn('credentials', {
        email: session.user.email,
        password: password,
        redirect: false,
      });

      if (signInResult?.ok) {
        console.log('Sign in successful, updating session...');
        
        // Force a complete session refresh
        await update();
        
        // Add a delay before redirect
        console.log('Redirecting to admin page in 2 seconds...');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 2000);
      } else {
        console.error('Sign in failed:', signInResult?.error);
        throw new Error('Failed to sign in with new password');
      }

    } catch (err) {
      console.error('Error in password reset flow:', err);
      toast.error(err.message);
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
          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaLock className="text-2xl text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Password updated!</h3>
                <p className="text-sm text-gray-600">
                  Your password has been successfully updated
                </p>
              </div>
            </motion.div>
          ) : (
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Set Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}