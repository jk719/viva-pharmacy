'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validatePassword } from '@/lib/auth';

export default function ResetPasswordForm({ token, email }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    errors: []
  });

  // Reset form if token changes
  useEffect(() => {
    setFormData({ password: '', confirmPassword: '' });
    setStatus({ type: '', message: '' });
  }, [token]);

  // Validate password as user types
  useEffect(() => {
    const validation = validatePassword(formData.password);
    setPasswordStrength(validation);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!passwordStrength.isValid) {
      setStatus({
        type: 'error',
        message: 'Please choose a stronger password'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          password: formData.password 
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Password has been reset successfully. Redirecting to login...'
        });
        setTimeout(() => {
          router.push('/?message=Password reset successful. Please sign in.');
        }, 2000);
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Failed to reset password'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          {email && (
            <p className="mt-2 text-center text-sm text-gray-600">
              for {email}
            </p>
          )}
        </div>

        {status.message && (
          <div
            className={`rounded-md p-4 ${
              status.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-400'
                : 'bg-red-50 text-red-700 border border-red-400'
            }`}
          >
            {status.message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {/* Password strength indicators */}
          {formData.password && (
            <div className="text-sm">
              {passwordStrength.errors.map((error, index) => (
                <p key={index} className="text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !passwordStrength.isValid}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (loading || !passwordStrength.isValid) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}