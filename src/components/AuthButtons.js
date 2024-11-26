"use client";

import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AuthButtons() {
  const { data: session, status, update: updateSession } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (isSignUp) {
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.phoneNumber && !/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
        setError("Invalid phone number format");
        return false;
      }
    }
    return true;
  };

  const handleAuthAction = async () => {
    if (!validateForm()) return;

    if (isSignUp) {
      try {
        setIsLoading(true);
        setError('');
        
        // Register the user
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber || undefined
          })
        });

        const registerData = await registerResponse.json();

        if (!registerData.success) {
          throw new Error(registerData.message || 'Registration failed');
        }

        // Auto-login after registration
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error);
        }

        // Show success toast
        toast.success('Account created! Please check your email for verification.');
        
        // Reset form and close dropdown
        setDropdownOpen(false);
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: ""
        });

        // No need for manual session update or router refresh
        // signIn will handle the session update

      } catch (error) {
        console.error('Registration/Login error:', error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle Sign In
      try {
        setIsLoading(true);
        setError('');
        
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          toast.error("Invalid email or password");
          setError("Sign in failed. Please check your credentials.");
        } else {
          setDropdownOpen(false);
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: ""
          });
          router.refresh();
        }
      } catch (error) {
        toast.error("Sign in failed");
        setError("Sign in failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Password reset instructions sent to your email');
        setDropdownOpen(false);
        setIsForgotPassword(false);
      } else {
        throw new Error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {session ? (
        <div className="flex items-center space-x-4">
          <span className="text-white">{session.user.email}</span>
          <button 
            onClick={() => signOut()} 
            className="text-white px-3 py-1 rounded transition-colors whitespace-nowrap" 
            style={{ backgroundColor: 'var(--button-red)' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={toggleDropdown}
            className="bg-white text-[#003366] hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Sign In
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#003366] rounded-lg shadow-lg overflow-hidden z-50">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">
                  {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-sm text-white/80">
                  {isForgotPassword ? "Enter your email to reset password" : 
                   isSignUp ? "Sign up for a new account" : "Sign in to your account"}
                </p>
              </div>

              {/* Form */}
              <div className="p-6 bg-[#003366]">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mb-3 border border-white/20 rounded-md bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  required
                />
                
                {!isForgotPassword && (
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mb-3 border border-white/20 rounded-md bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-transparent"
                    required
                  />
                )}

                {/* Action Button */}
                <button
                  onClick={isForgotPassword ? handleForgotPassword : handleAuthAction}
                  disabled={isLoading}
                  className="w-full bg-white text-[#003366] py-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isForgotPassword ? "Send Reset Link" :
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </button>

                {/* Links */}
                <div className="mt-4 text-center space-y-2">
                  {!isForgotPassword ? (
                    <>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsForgotPassword(true);
                          setError("");
                        }}
                        className="block text-sm text-white/80 hover:text-white transition-colors"
                      >
                        Forgot password?
                      </a>
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-[#003366] text-white/60">Or</span>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsSignUp(!isSignUp);
                          setError("");
                        }}
                        className="block text-sm text-white/80 hover:text-white transition-colors"
                      >
                        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                      </a>
                    </>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPassword(false);
                        setError("");
                      }}
                      className="block text-sm text-white/80 hover:text-white transition-colors"
                    >
                      ← Back to Sign In
                    </a>
                  )}
                </div>

                {/* Error Messages */}
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
