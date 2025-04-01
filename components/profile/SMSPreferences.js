'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const SMS_PREFERENCE_TYPES = {
  orderUpdates: {
    title: 'Order Updates',
    description: 'Get SMS updates about your orders'
  },
  prescriptionStatus: {
    title: 'Prescription Updates',
    description: 'Receive SMS notifications about your prescriptions'
  },
  deliveryUpdates: {
    title: 'Delivery Updates',
    description: 'Get real-time delivery status via SMS'
  },
  promotionalMessages: {
    title: 'Promotional Messages',
    description: 'Receive special offers and promotions via SMS'
  },
  appointmentReminders: {
    title: 'Appointment Reminders',
    description: 'Get SMS reminders for your pharmacy appointments'
  },
  refillReminders: {
    title: 'Refill Reminders',
    description: 'Receive SMS notifications when prescriptions need refilling'
  }
};

export default function SMSPreferences() {
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    prescriptionStatus: true,
    deliveryUpdates: true,
    promotionalMessages: false,
    appointmentReminders: true,
    refillReminders: true
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/sms-preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      
      const data = await response.json();
      setPreferences(data.smsPreferences || preferences);
      setPhoneNumber(data.phoneNumber || '');
    } catch (err) {
      setError('Failed to load SMS preferences');
      toast.error('Failed to load SMS preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (preference) => {
    try {
      setIsSaving(true);
      const newPreferences = {
        ...preferences,
        [preference]: !preferences[preference]
      };

      const response = await fetch('/api/user/sms-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsPreferences: newPreferences })
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      setPreferences(newPreferences);
      toast.success('SMS preferences updated');
    } catch (err) {
      setError('Failed to update preferences');
      toast.error('Failed to update SMS preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your SMS notification preferences
        </p>
      </div>

      {!phoneNumber ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please add a phone number to your profile to enable SMS notifications.{' '}
                <Link href="/profile/edit" className="font-medium underline hover:text-yellow-800">
                  Edit Profile
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(SMS_PREFERENCE_TYPES).map(([key, { title, description }]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <button
                onClick={() => handleToggle(key)}
                disabled={isSaving}
                className={`${
                  preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    preferences[key] ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 