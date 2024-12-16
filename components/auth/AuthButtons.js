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
      await signOut({
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: force refresh the page
      window.location.href = '/';
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
        className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-full transition-all duration-300"
      >
        Sign In
      </button>

      {showLogin && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] md:w-80 md:left-auto md:right-0 md:-translate-x-0 bg-[#003366] rounded-lg shadow-lg p-6 z-30 animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-sm text-gray-300">Sign in to your account</p>
            </div>
            <button 
              onClick={() => setShowLogin(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close login form"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-[#002347] border border-[#004386] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#002347] border border-[#004386] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#003366] py-3 rounded-md hover:bg-gray-100 transition-colors duration-200 font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-gray-300 hover:text-white transition-colors">
              Forgot password?
            </Link>
          </div>
          
          <div className="mt-4 text-center border-t border-[#004386] pt-4">
            <span className="text-sm text-gray-300">
              Or
            </span>
            <div className="mt-2">
              <Link href="/register" className="text-sm text-gray-300 hover:text-white transition-colors">
                Don&apos;t have an account? Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
