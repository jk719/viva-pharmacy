'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { requestPasswordReset } from '@/app/actions/auth';

export default function ResetPasswordForm({ isManagerReset = false }) {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create form data for the server action
      const formData = new FormData();
      formData.append('email', email);

      // Use server action instead of API route
      const result = await requestPasswordReset(formData);

      if (result.success) {
        toast.success('Password reset link sent to your email');
        
        // For managers who need to update session
        if (isManagerReset && session?.user?.role === 'MANAGER') {
          router.push('/admin');
        }
      } else {
        toast.error(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred while sending reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Sending...' : 'Reset Password'}
      </button>
    </form>
  );
} 