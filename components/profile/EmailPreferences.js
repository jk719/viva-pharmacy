'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getUserEmailPreferences, updateEmailPreferences } from '@/app/actions/emailPreferences';

const PREFERENCE_TYPES = {
  pointsNotifications: {
    title: 'Points Updates',
    description: 'Get notified when you earn or redeem points'
  },
  tierUpdates: {
    title: 'Tier Changes',
    description: 'Receive updates when you reach a new tier level'
  },
  specialEvents: {
    title: 'Special Events',
    description: 'Stay informed about special promotions and events'
  },
  birthdayRewards: {
    title: 'Birthday Rewards',
    description: 'Get special birthday offers and rewards'
  },
  promotionalEmails: {
    title: 'Promotional Emails',
    description: 'Receive exclusive deals and offers'
  }
};

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const result = await getUserEmailPreferences();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPreferences(result.emailPreferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    try {
      setSaving(true);
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key]
      };

      // Create form data
      const formData = new FormData();
      formData.append('emailPreferences', JSON.stringify(newPreferences));
      
      const result = await updateEmailPreferences(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setPreferences(result.emailPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900">Email Preferences</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your VivaBucks rewards notifications
        </p>
      </div>

      <div className="p-6 space-y-6">
        {Object.entries(PREFERENCE_TYPES).map(([key, { title, description }]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="ml-4">
              <button
                type="button"
                onClick={() => handleToggle(key)}
                disabled={saving}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${preferences[key] ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                    transition duration-200 ease-in-out
                    ${preferences[key] ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900">About Email Notifications</h4>
          <ul className="mt-2 text-sm text-blue-700 space-y-1">
            <li>• You can change these preferences at any time</li>
            <li>• We'll always send you important account notifications</li>
            <li>• Your email preferences are tied to your VivaBucks account</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 