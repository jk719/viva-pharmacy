'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MessageDisplay() {
  const searchParams = useSearchParams();
  const [displayMessage, setDisplayMessage] = useState(null);
  const [displayError, setDisplayError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    
    if (message) setDisplayMessage(message);
    if (error) setDisplayError(error === 'CredentialsSignin' ? 'Invalid email or password' : error);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!displayMessage && !displayError) return null;
  
  if (displayError && displayError !== 'undefined') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded 
                    animate-fadeIn transition-all duration-300">
        {displayError}
      </div>
    );
  }
  
  if (displayMessage) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded
                    animate-fadeIn transition-all duration-300">
        {displayMessage}
      </div>
    );
  }

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const autoLogin = async () => {
      const verificationSuccess = searchParams.get('verification') === 'success';
      const email = searchParams.get('email');
      
      if (verificationSuccess && email) {
        console.log('Attempting auto-login after verification for:', email);
        setLoading(true);
        
        try {
          const result = await signIn('credentials', {
            redirect: false,
            email: email.toLowerCase().trim(),
            verificationLogin: 'true'
          });

          console.log('Auto-login result:', result);

          if (result?.ok) {
            console.log('Auto-login successful, redirecting...');
            router.push('/?message=Welcome! Your email has been verified.');
            router.refresh();
          } else {
            console.error('Auto-login failed:', result?.error);
            setError('Auto-login failed. Please sign in manually.');
            setFormData(prev => ({ ...prev, email }));
          }
        } catch (err) {
          console.error('Auto-login error:', err);
          setError('Auto-login failed. Please sign in manually.');
        } finally {
          setLoading(false);
        }
      }
    };

    autoLogin();
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      if (!result) {
        throw new Error('No response from authentication server');
      }

      if (result.error) {
        switch (result.error) {
          case 'Please verify your email before logging in':
            setError('Please check your email for verification link');
            break;
          case 'CredentialsSignin':
            setError('Invalid email or password');
            break;
          default:
            setError(result.error);
        }
      } else if (result.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <MessageDisplay />
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center py-2 px-4 
                border border-transparent text-sm font-medium rounded-md 
                text-white bg-indigo-600 hover:bg-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}