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
        router.push('/');
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
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      
      await signOut({
        callbackUrl: `${baseUrl}/`,
        redirect: false
      });
      
      // Clear any local state/storage if needed
      // Force navigation and refresh
      router.push('/');
      router.refresh();
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Ultimate fallback
      window.location.href = '/';
    }
  };

  // Add navigation handler
  const handleNavigation = () => {
    setShowLogin(false);
  };

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowLogin(!showLogin)}
          aria-expanded={showLogin}
          aria-haspopup="true"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                   bg-white/10 hover:bg-white/20 active:bg-white/15
                   transition-all duration-200 ease-out transform hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-white/50
                   shadow-lg shadow-primary/10 hover:shadow-xl
                   backdrop-blur-sm"
        >
          <span className="max-w-[150px] truncate text-sm font-medium">{session.user.email}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${showLogin ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showLogin && (
          <div 
            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl 
                     border border-blue-50 overflow-hidden z-30 
                     animate-scaleSpring backdrop-blur-sm
                     transform transition-all duration-300"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{session.user.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">Signed in</p>
            </div>
            
            <div className="p-2">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                         rounded-lg hover:bg-gray-50 active:bg-gray-100
                         transition-colors duration-150"
                role="menuitem"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600
                         rounded-lg hover:bg-red-50 active:bg-red-100
                         transition-colors duration-150"
                role="menuitem"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowLogin(!showLogin)}
        aria-expanded={showLogin}
        aria-controls="login-form"
        className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium
                 bg-white text-primary rounded-full
                 hover:bg-blue-50 active:bg-blue-100
                 transform transition-all duration-200 hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                 shadow-lg hover:shadow-xl shadow-primary/10
                 animate-bounce-subtle"
      >
        Sign In
      </button>

      {showLogin && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop with fade-in */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fadeIn"
            aria-hidden="true"
            onClick={() => setShowLogin(false)}
          />

          {/* Modal container with centered positioning */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div 
              className="relative w-full max-w-md transform rounded-2xl bg-white
                       shadow-2xl transition-all
                       animate-modalAppear origin-center"
              id="login-form"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setShowLogin(false)}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-500
                           hover:bg-gray-100 focus:outline-none focus:ring-2
                           focus:ring-primary-color"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900" id="modal-title">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-500">
                    Please sign in to your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div 
                      className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
                      role="alert"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3
                                 text-gray-800 placeholder-gray-400
                                 focus:border-primary focus:ring-primary
                                 transition-all duration-200
                                 bg-blue-50/30 hover:bg-blue-50/50
                                 focus:bg-white focus:shadow-inner
                                 transform hover:scale-[1.01]"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3
                                 text-gray-800 placeholder-gray-400
                                 focus:border-primary focus:ring-primary
                                 transition-all duration-200
                                 bg-blue-50/30 hover:bg-blue-50/50
                                 focus:bg-white focus:shadow-inner
                                 transform hover:scale-[1.01]"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link 
                      href="/forgot-password"
                      onClick={handleNavigation}
                      className="font-medium text-primary hover:text-primary-light
                               transition-all duration-200 hover:scale-105 inline-block
                               hover:underline decoration-2 underline-offset-4
                               transform"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-xl
                             bg-primary px-5 py-3.5 text-sm font-medium text-white
                             hover:bg-primary-light focus:outline-none focus:ring-2
                             focus:ring-primary focus:ring-offset-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200 transform hover:scale-[1.02]
                             shadow-lg shadow-primary/20 hover:shadow-xl
                             active:scale-95"
                  >
                    {loading ? (
                      <>
                        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link 
                        href="/register"
                        onClick={handleNavigation}
                        className="font-medium text-primary hover:text-primary-light
                                 transition-all duration-200 hover:scale-105 inline-block
                                 hover:underline decoration-2 underline-offset-4
                                 transform"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
