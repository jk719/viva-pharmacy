'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ProfileInfo from '@/components/profile/ProfileInfo';
import OrderHistory from '@/components/profile/OrderHistory';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('info');

  if (!session) {
    return <div className="container mx-auto px-4 py-8">Please sign in to view your profile</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded ${
            activeTab === 'info' 
              ? 'bg-primary-color text-white' 
              : 'bg-gray-200'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded ${
            activeTab === 'orders' 
              ? 'bg-primary-color text-white' 
              : 'bg-gray-200'
          }`}
        >
          Order History
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'info' ? (
          <ProfileInfo user={session.user} />
        ) : (
          <OrderHistory userId={session.user.id} />
        )}
      </div>
    </div>
  );
} 