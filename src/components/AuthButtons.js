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

  return (
    <div className="relative flex flex-col items-center">
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
            disabled={isLoading}
            className="text-white px-3 py-1 rounded transition-colors whitespace-nowrap"
            style={{ backgroundColor: 'var(--button-green)' }}
          >
            {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-2 w-64 bg-primary-color shadow-md rounded-md p-4 z-10 left-1/2 transform -translate-x-1/2 md:left-auto md:right-0 md:transform-none" 
                 style={{ backgroundColor: "#003366", color: "var(--text-color)" }}>
              <h2 className="text-lg font-bold mb-3" style={{ color: "white" }}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </h2>
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mb-2 p-2 border rounded"
                required
              />
              
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mb-2 p-2 border rounded"
                required
              />

              {isSignUp && (
                <>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                    required
                  />
                  
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number (Optional)"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full mb-2 p-2 border rounded"
                  />
                </>
              )}

              <button
                onClick={handleAuthAction}
                disabled={isLoading}
                className="w-full button-primary py-2 rounded mt-2"
                style={{ backgroundColor: "white" }}
              >
                {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
              
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage("");
                  setError("");
                  setFormData({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phoneNumber: ""
                  });
                }}
                className="underline mt-2 text-sm"
                style={{ color: "#ffffff" }}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
              
              {message && (
                <p className="mt-2 text-sm" style={{ color: message.includes("success") ? "green" : "red" }}>
                  {message}
                </p>
              )}
              {error && (
                <p className="mt-2 text-sm" style={{ color: "red" }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
