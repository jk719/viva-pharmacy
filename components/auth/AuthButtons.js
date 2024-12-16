"use client";
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AuthButtons() {
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogin(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowLogin(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (result.error) {
        setError(result.error);
      } else {
        setShowLogin(false);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setShowLogin(false);
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await signOut({
        callbackUrl: baseUrl,
        redirect: true
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowLogin(!showLogin)}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-full transition-all duration-300"
        >
          {session.user.email}
        </button>

        {showLogin && (
          <div className="absolute right-0 mt-2 w-48 bg-[#003366] rounded-lg shadow-lg p-4 z-30">
            <Link href="/profile" className="block text-white hover:text-gray-200 mb-2">
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left text-white hover:text-gray-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowLogin(!showLogin)}
        className="bg-[#FF9F43] hover:bg-[#FF9F43]/90 text-white font-medium px-4 py-2 rounded-full transition-all duration-300"
      >
        Sign In
      </button>

      {showLogin && (
        <div className="fixed inset-x-0 top-[72px] mx-auto w-[90vw] max-w-[400px] md:w-[360px] md:absolute md:top-full 
          md:right-0 md:transform-none bg-[#002347] rounded-xl shadow-xl p-6 z-30 animate-slideDown
          md:translate-x-[0] md:left-auto md:mx-0 border border-white/10"
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
              <p className="text-sm text-gray-300 mt-1">Sign in to your account</p>
            </div>
            <button 
              onClick={() => setShowLogin(false)}
              className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close login form"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F43] focus:border-transparent
                  transition-all duration-200"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9F43] focus:border-transparent
                  transition-all duration-200"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF9F43] text-white py-2.5 rounded-lg hover:bg-[#FF9F43]/90 
                transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex items-center justify-between mt-4">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#002347] text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Link 
              href="/register" 
              onClick={() => setShowLogin(false)}
              className="block w-full text-center py-2.5 mt-4 rounded-lg border border-white/10 
                text-sm text-white hover:bg-white/5 transition-colors duration-200"
            >
              Create an account
            </Link>
          </form>
        </div>
      )}
    </div>
  );
}
