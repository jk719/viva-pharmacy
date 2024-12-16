'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-16 md:mt-20">
      <div className="max-w-[420px] w-full space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-lg">
        <div className="space-y-2">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="text-center text-sm text-gray-500">
            Enter your email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              Check your email for a link to reset your password.
            </div>
            <Link 
              href="/login"
              className="block w-full text-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>

            <div className="text-sm text-center text-gray-500">
              Remember your password?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center px-4 mt-16 md:mt-20">
          <div className="animate-pulse max-w-[420px] w-full">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded w-64 mb-8 mx-auto"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-24"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-primary/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
