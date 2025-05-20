'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import toast from 'react-hot-toast';
import { FaStar, FaGift, FaCoins, FaEnvelope, FaLock, FaPhone, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { registerUser } from '@/app/actions/auth';

function RegisterContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Phone Verification State
  const [otpCode, setOtpCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle', 'sendingOtp', 'awaitingOtp', 'verifyingOtp', 'verified', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // If phone number is changed, reset verification status
    if (name === 'phoneNumber') {
      setVerificationStatus('idle');
      setVerificationMessage('');
      setOtpCode('');
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phoneNumber) {
      setVerificationMessage('Please enter a phone number.');
      setVerificationStatus('error');
      return;
    }
    setVerificationStatus('sendingOtp');
    setVerificationMessage(''); // Clear previous messages
    try {
      const response = await fetch('/api/auth/verify/phone/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVerificationStatus('awaitingOtp');
        setVerificationMessage('OTP sent successfully! Check your phone.');
        toast.success('OTP sent to your phone!');
      } else {
        setVerificationStatus('error');
        setVerificationMessage(data.message || 'Failed to send OTP. Please try again.');
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setVerificationStatus('error');
      setVerificationMessage('An network error occurred. Please try again.');
      toast.error('Network error sending OTP.');
      console.error('Send OTP error:', err);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) { // Basic validation for OTP length
      setVerificationMessage('Please enter a valid OTP.');
      setVerificationStatus('error'); // Or keep 'awaitingOtp' and show message
      return;
    }
    setVerificationStatus('verifyingOtp');
    setVerificationMessage('');
    try {
      const response = await fetch('/api/auth/verify/phone/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, code: otpCode }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.status === 'approved') {
        setVerificationStatus('verified');
        setVerificationMessage('Phone number verified successfully!');
        toast.success('Phone number verified!');
        setError(''); // Clear main form error if it was due to phone verification
      } else {
        setVerificationStatus('error'); // Or 'awaitingOtp' to allow retry with same OTP or resend
        setVerificationMessage(data.message || 'Invalid OTP or verification failed. Please try again.');
        toast.error(data.message || 'Invalid OTP.');
        setOtpCode(''); // Clear OTP input on failure
      }
    } catch (err) {
      setVerificationStatus('error');
      setVerificationMessage('A network error occurred. Please try again.');
      toast.error('Network error verifying OTP.');
      console.error('Verify OTP error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.phoneNumber && smsConsent && verificationStatus !== 'verified') {
      setError('Please verify your phone number before creating an account.');
      toast.error('Please verify your phone number.');
      setLoading(false);
      return;
    }

    try {
      // Create form data for the server action
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('password', formData.password);
      if (formData.phoneNumber) {
        formDataObj.append('phoneNumber', formData.phoneNumber);
        // Pass SMS consent only if phone number is provided
        if (smsConsent) {
          formDataObj.append('smsConsent', smsConsent.toString());
        }
      }
      
      // Call server action instead of API
      const result = await registerUser(formDataObj);

      if (result.success) {
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
        router.push('/api/auth/signin?registration=success');
      } else {
        toast.error(result.message || 'Something went wrong');
        setError(result.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Simplified Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaGift className="text-emerald-500" />
              <span>$5 Welcome Bonus</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <FaCoins className="text-blue-500" />
              <span>100 VivaBucks</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 border border-red-100"
              >
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm
                             ${formData.confirmPassword && formData.password !== formData.confirmPassword 
                               ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                               : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-500"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 transition duration-150
                             bg-gray-50/30 focus:bg-white sm:text-sm"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={verificationStatus === 'verified' || verificationStatus === 'sendingOtp' || verificationStatus === 'verifyingOtp'}
                  />
                </div>
              </div>
            </div>

            {/* SMS Consent Checkbox */}
            {formData.phoneNumber && ( // Only show consent if a phone number is being entered
              <div className="mt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sms-consent"
                      name="sms-consent"
                      type="checkbox"
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      disabled={verificationStatus === 'verified'}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sms-consent" className="font-medium text-gray-700">
                      Receive SMS updates
                    </label>
                    <p className="text-gray-500 text-xs mt-1">
                      I agree to receive transactional SMS messages from Viva Pharmacy for order updates, prescription alerts, and account verification. Message and data rates may apply. Reply STOP to unsubscribe.
                      View our <Link href="/terms-of-service" className="underline hover:text-orange-500">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-orange-500">Privacy Policy</Link>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* OTP Verification Section (only if phone number and SMS consent are provided) */}
            {formData.phoneNumber && smsConsent && verificationStatus !== 'verified' && (
              <div className="space-y-4 pt-2 border-t border-gray-200 mt-4">
                <h3 className="text-md font-medium text-gray-800">Phone Verification</h3>
                {verificationStatus === 'idle' || verificationStatus === 'error' || verificationStatus === 'awaitingOtp' && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={verificationStatus === 'sendingOtp' || verificationStatus === 'verified' || !formData.phoneNumber.trim()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {verificationStatus === 'sendingOtp' ? 'Sending OTP...' : (verificationStatus === 'awaitingOtp' ? 'Resend OTP' : 'Send OTP')}
                  </button>
                )}

                {(verificationStatus === 'awaitingOtp' || verificationStatus === 'verifyingOtp' || verificationStatus === 'error') && (
                  <div className="relative">
                    <FaStar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /> {/* Placeholder icon */}
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      maxLength="6"
                      className="appearance-none rounded-xl relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Enter OTP Code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      disabled={verificationStatus === 'verifyingOtp' || verificationStatus === 'verified'}
                    />
                  </div>
                )}
                
                {verificationStatus === 'awaitingOtp' && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!otpCode || otpCode.length < 4 || verificationStatus === 'verifyingOtp' || verificationStatus === 'verified'}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {verificationStatus === 'verifyingOtp' ? 'Verifying...' : 'Verify OTP'}
                  </button>
                )}

                {verificationMessage && (
                  <p className={`text-sm ${verificationStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {verificationMessage}
                  </p>
                )}
              </div>
            )}
            {formData.phoneNumber && verificationStatus === 'verified' && (
              <div className="pt-2 mt-4 text-center">
                <p className="text-sm text-green-600 font-medium flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Phone Number Verified Successfully!
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4
                       rounded-xl text-sm font-medium text-white
                       bg-gradient-to-r from-[#FF9F43] to-[#FFB976]
                       hover:from-[#ff9429] hover:to-[#ffa851]
                       focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-orange-500 transition-all duration-200
                       shadow-lg shadow-orange-200/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/?showLogin=true"
              className="font-medium text-[#FF9F43] hover:text-[#ff9429]
                       transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
          <div className="animate-pulse max-w-md w-full space-y-8 p-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
