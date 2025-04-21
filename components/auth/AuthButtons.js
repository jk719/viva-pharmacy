"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut, signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiUser } from 'react-icons/fi';
import sseManager from '@/lib/sseManager';
import { trackUserLogin, trackUserSignUp } from '@/lib/analytics/events';

const VERIFICATION_SUCCESS = 'verification_success';

// Helper function to get user initials or shortened email
const formatEmailForDisplay = (email, isMobile) => {
  if (!email) return 'Account';
  if (!isMobile) return email;
  
  // For mobile: show first part of email before @
  const [username] = email.split('@');
  if (username.length <= 8) return username;
  return username.slice(0, 6) + '...';
};

const closeExistingSSE = (userId) => {
  if (typeof window !== 'undefined' && window._eventSource) {
    console.log('🔌 Closing existing SSE connection');
    window._eventSource.close();
    window._eventSource = null;
  }
};

const AuthButtons = ({ isMobile = false }) => {
  const { data: session, status, update: updateSession } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Reset error when form is opened/closed
  useEffect(() => {
    if (!showLogin) {
      setError('');
      setFormData({ email: '', password: '' });
    }
  }, [showLogin]);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verification') === 'success' || 
        params.get('showLogin') === 'true') {
      setShowLogin(true);
      
      // Store callbackUrl if present
      const callbackUrl = params.get('callbackUrl');
      if (callbackUrl) {
        sessionStorage.setItem('loginCallbackUrl', callbackUrl);
      }
      
      // Clean up the URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    // Check for verification success message
    const params = new URLSearchParams(window.location.search);
    if (params.get('verification') === 'success') {
      setShowLogin(true);
      toast.success('Email verified! Please sign in to continue.');
      // Clean up the URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Add effect to handle session updates
  useEffect(() => {
    const handleStorageChange = async () => {
      if (typeof window !== 'undefined') {
        // Force session refresh when auth state changes
        await updateSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateSession]);

  // Add function to refresh session
  const refreshSession = async () => {
    await updateSession();
    router.refresh();
  };

  const closeAllConnections = () => {
    if (typeof window !== 'undefined' && window._sseConnection) {
      console.log('🔌 Closing SSE connection during sign out');
      window._sseConnection.close();
      window._sseConnection = null;
    }
    // Also clean up global connection tracker if it exists
    if (typeof globalConnectionTracker !== 'undefined') {
      globalConnectionTracker.cleanup();
    }
  };

  const handleSignOut = async () => {
    try {
      setShowLogin(false);
      
      // Close SSE connection
      sseManager?.cleanup();
      
      // Clear storage
      if (typeof window !== 'undefined') {
        ['cart', 'selectedCategories'].forEach(item => 
          localStorage.removeItem(item)
        );
      }
      
      // Sign out
      await signOut({ 
        redirect: true,
        callbackUrl: '/' 
      });
      // No need for router.push('/') because redirect: true will handle it
      
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔑 Login attempt:', { 
      email: formData.email,
      url: window.location.href,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    try {
      // Close any existing connections before login
      closeAllConnections();

      console.log('Calling signIn with credentials');
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      console.log('🔒 Auth result:', {
        ok: result?.ok,
        status: result?.status,
        error: result?.error,
        url: result?.url
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.ok) {
        setShowLogin(false);
        toast.success('Successfully signed in!');
        trackUserLogin();
        
        // Client-side navigation to avoid full reload
        router.push(result.url || '/');
        router.refresh();
      }
    } catch (err) {
      console.error('🚫 Auth error:', {
        message: err.message,
        name: err.name,
        code: err.code
      });
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update the session effect
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user) {
        console.log('Session established:', session);
        setShowLogin(false);
        router.refresh();
      }
    };

    if (status === "authenticated") {
      checkSession();
    }
  }, [status, router]);

  // Add navigation handler
  const handleNavigation = () => {
    setShowLogin(false);
  };

  const buttonStyles = {
    base: `inline-flex items-center justify-center font-medium
           rounded-full transition-all duration-200
           shadow-lg hover:shadow-xl active:shadow-md
           transform hover:scale-105 active:scale-95`,
    signIn: `bg-gradient-to-r from-[#FF9F43] to-[#FFB976]
             hover:from-[#ff9429] hover:to-[#ffa851]
             text-white font-semibold
             border border-[#FF9F43]/20
             focus:ring-2 focus:ring-[#FF9F43]/50 focus:ring-offset-1`,
    mobile: 'px-3 py-1.5 text-sm',
    desktop: 'px-4 py-2 text-base',
    icon: `mr-2 h-5 w-5 ${isMobile ? 'hidden' : 'inline-block'}`
  };

  if (status === 'loading') {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-20 bg-white/10 rounded-full"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setShowLogin(!showLogin)}
          aria-expanded={showLogin}
          aria-haspopup="true"
          className={`${buttonStyles.base} ${buttonStyles.signIn} ${isMobile ? buttonStyles.mobile : buttonStyles.desktop}
                     whitespace-nowrap`}
        >
          <FiUser 
            className={`${isMobile ? 'w-3.5 h-3.5 mr-1' : 'w-4 h-4 mr-2'}`}
          />
          <span className="relative truncate max-w-[150px]">
            {formatEmailForDisplay(session.user.email, isMobile)}
          </span>
        </button>

        {showLogin && (
          <div 
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl 
                     border border-gray-100 overflow-hidden z-50
                     animate-scaleSpring backdrop-blur-sm
                     transform origin-top-right transition-all duration-200"
            style={{
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: 'calc(100vh - 100px)',
              right: isMobile ? '0' : '0',
            }}
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
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setShowLogin(!showLogin)}
        className={`
          ${buttonStyles.base}
          ${buttonStyles.signIn}
          ${isMobile ? buttonStyles.mobile : buttonStyles.desktop}
          whitespace-nowrap
        `}
      >
        <FiUser 
          className={`${isMobile ? 'w-3.5 h-3.5 mr-1' : 'w-4 h-4 mr-2'}`}
        />
        <span className="relative whitespace-nowrap">
          Sign In
        </span>
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
};

export default AuthButtons;
