'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { FaGift, FaTv, FaCheckCircle, FaEnvelope, FaMobile, FaMapMarkerAlt, FaCheckSquare } from 'react-icons/fa';
import Image from 'next/image';

// TV specs for the giveaway
const tvSpecs = [
  { icon: "📺", text: "55\" 4K Ultra HD Display" },
  { icon: "🔊", text: "Dolby Atmos Sound" },
  { icon: "🎮", text: "Built-in Gaming Mode" },
  { icon: "🎬", text: "All Streaming Apps Included" },
  { icon: "🔄", text: "Smart Home Compatible" },
  { icon: "📱", text: "Voice Remote Control" },
];

export default function GiveawayPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/giveaway-entry', data);
      setSubmitted(true);
      reset();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-4 pt-[calc(var(--navbar-height)+80px)] md:pt-[calc(var(--navbar-height-md)+var(--loyalty-banner-height-md)+1rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <FaGift className="text-5xl text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Win a Free 55" Smart TV!</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter for a chance to win this amazing smart TV. Open to residents within 3 miles of Jackson Heights (ZIP 11372).
          </p>
        </div>

        {/* TV Showcase with Static Image */}
        <div className="mb-10 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="mt-6 mb-6 flex justify-center">
            <Image
              src="/images/giveaway/fire-tv-giveaway.png"
              alt="Smart TV Giveaway"
              width={600} 
              height={400} 
              className="rounded-lg shadow-lg"
              priority 
            />
          </div>

          {/* TV Specifications */}
          <div className="py-6 bg-white lg:px-0">
            <h2 className="text-2xl font-semibold mb-4 text-center">Amazing TV Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-3">
              {tvSpecs.map((spec, idx) => (
                <div key={idx} className="flex items-start p-2 bg-blue-50 rounded-lg lg:min-w-0">
                  <div className="text-xl mr-2">{spec.icon}</div>
                  <div className="text-sm text-gray-800 break-words">{spec.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Entry Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {submitted ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
              <p className="text-xl text-gray-600 mb-6">You're entered into our giveaway!</p>
              <p className="text-gray-600">
                Winner will be announced on May 25th.<br />
                We'll contact you if you're selected.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">Enter the Giveaway</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center border rounded overflow-hidden">
                      <div className="bg-gray-100 p-3">
                        <FaCheckCircle className="text-gray-400" />
                      </div>
                      <input 
                        {...register('name', { required: "Name is required" })} 
                        placeholder="Your Full Name" 
                        className="w-full p-2.5 md:p-3 focus:outline-none" 
                      />
                    </div>
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center border rounded overflow-hidden">
                      <div className="bg-gray-100 p-3">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input 
                        {...register('email', { 
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address"
                          }
                        })} 
                        placeholder="Your Email Address" 
                        className="w-full p-2.5 md:p-3 focus:outline-none" 
                      />
                    </div>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center border rounded overflow-hidden">
                      <div className="bg-gray-100 p-3">
                        <FaMobile className="text-gray-400" />
                      </div>
                      <input 
                        {...register('phone', { 
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Please enter a valid 10-digit phone number"
                          }
                        })} 
                        placeholder="Mobile Number (10 digits)" 
                        className="w-full p-2.5 md:p-3 focus:outline-none" 
                      />
                    </div>
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center border rounded overflow-hidden">
                      <div className="bg-gray-100 p-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                      </div>
                      <input 
                        {...register('zip', { 
                          required: "ZIP code is required",
                          pattern: {
                            value: /^[0-9]{5}$/,
                            message: "Please enter a valid 5-digit ZIP code"
                          }
                        })} 
                        placeholder="ZIP Code (5 digits)" 
                        maxLength={5} 
                        className="w-full p-2.5 md:p-3 focus:outline-none" 
                      />
                    </div>
                    {errors.zip && <p className="text-red-600 text-sm mt-1">{errors.zip.message}</p>}
                  </div>
                </div>
                
                <div className="space-y-2 md:space-y-3">
                  <label className="flex items-center space-x-3 py-1 md:py-2">
                    <input type="checkbox" {...register('emailOptIn', { required: "Please agree to receive marketing emails" })} className="h-4 md:h-5 w-4 md:w-5 rounded text-blue-600" />
                    <span className="text-sm md:text-base text-gray-700">I agree to receive marketing emails from Viva Pharmacy</span>
                  </label>
                  {errors.emailOptIn && <p className="text-red-600 text-sm">{errors.emailOptIn.message}</p>}
                  
                  <label className="flex items-center space-x-3 py-1 md:py-2">
                    <input type="checkbox" {...register('smsOptIn', { required: "Please agree to receive SMS messages" })} className="h-4 md:h-5 w-4 md:w-5 rounded text-blue-600" />
                    <span className="text-sm md:text-base text-gray-700">I agree to receive SMS messages from Viva Pharmacy</span>
                  </label>
                  {errors.smsOptIn && <p className="text-red-600 text-sm">{errors.smsOptIn.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-300 flex items-center justify-center"
                >
                  {loading ? 'Submitting...' : 'Enter Giveaway'}
                  {!loading && <FaGift className="ml-2" />}
                </button>
                
                <p className="text-xs text-gray-500 mt-2">
                  By entering, you agree to receive occasional emails and SMS messages from Viva Pharmacy. 
                  Standard message rates may apply. You may unsubscribe at any time.
                </p>
              </form>
            </>
          )}
        </div>
        
        {/* Rules Section */}
        <div className="mt-6 text-center text-gray-600 mb-4">
          <h3 className="text-lg font-semibold mb-2">Giveaway Rules</h3>
          <p className="text-sm max-w-3xl mx-auto">
            Must be 18+ and live within 3 miles of our Jackson Heights location.
            No purchase necessary. Winner will be selected randomly on May 25, 2025.
            Employees and their immediate family members are not eligible.
          </p>
        </div>
      </div>
    </div>
  );
}
