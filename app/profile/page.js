'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ProfileInfo from '@/components/profile/ProfileInfo';
import OrderHistory from '@/components/profile/OrderHistory';
import VivaBucksDashboard from '@/components/profile/VivaBucksDashboard';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('info');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-[#003366] text-xl">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Welcome, {userData?.firstName || session.user.email}
          </h1>
          <p className="text-[#4d6580]">Manage your account and view your orders</p>
        </div>

        {/* Updated Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex space-x-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'info'
                  ? 'bg-[#003366] text-white shadow-md transform scale-105'
                  : 'text-[#003366] hover:bg-[#e6eef5]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile Information</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'rewards'
                  ? 'bg-[#003366] text-white shadow-md transform scale-105'
                  : 'text-[#003366] hover:bg-[#e6eef5]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>VivaBucks Rewards</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-[#003366] text-white shadow-md transform scale-105'
                  : 'text-[#003366] hover:bg-[#e6eef5]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Order History</span>
              </div>
            </button>
          </div>
        </div>

        {/* Updated Content Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e6eef5]">
          <div className={`transition-opacity duration-200 ${activeTab === 'info' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <ProfileInfo user={userData || session.user} />
          </div>
          <div className={`transition-opacity duration-200 ${activeTab === 'rewards' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <VivaBucksDashboard />
          </div>
          <div className={`transition-opacity duration-200 ${activeTab === 'orders' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <OrderHistory userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 