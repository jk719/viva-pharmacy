'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordStrengthIndicator } from '@/components/auth';
import toast from 'react-hot-toast';

function RegisterContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  if (session) {
    return null;
  }

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
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-16 md:mt-20">
      <div className="max-w-[420px] w-full space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-lg">
        <div className="space-y-2">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="text-center text-sm text-gray-500">
            Join VIVA Pharmacy & Wellness today
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-sm"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Re-enter Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className={`appearance-none rounded-lg relative block w-full px-4 py-3 border placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-sm
                  ${formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'}`}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-sm"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (formData.password !== formData.confirmPassword)}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
              (loading || formData.password !== formData.confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link 
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
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
              <div className="h-4 bg-gray-100 rounded w-24"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-100 rounded w-24"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-primary/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
