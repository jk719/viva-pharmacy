'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordStrengthIndicator } from '@/components/auth';
import toast from 'react-hot-toast';
import { FaStar, FaGift, FaCoins, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

function RegisterContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          '✨ Account created successfully!\n✉️ Please check your email to verify your account.', 
          {
            duration: 6000,
            style: {
              background: '#003366',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              maxWidth: '500px',
              whiteSpace: 'pre-line'
            },
          }
        );
        router.push('/?message=Registration+successful');
      } else {
        toast.error(data.message || 'Something went wrong');
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Simplified Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaGift className="text-emerald-500" />
              <span>$5 Welcome Bonus</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <FaCoins className="text-blue-500" />
              <span>100 VivaBucks</span>
            </div>
          </div>
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
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
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
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <PasswordStrengthIndicator password={formData.password} />
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
                             ${formData.confirmPassword && formData.password !== formData.confirmPassword 
                               ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                               : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-500"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="(Optional)"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/')}
              className="font-medium text-[#FF9F43] hover:text-[#ff9429]
                       transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
          <div className="animate-pulse max-w-md w-full space-y-8 p-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
