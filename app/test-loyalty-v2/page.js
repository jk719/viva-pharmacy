'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaSync, FaCog, FaCheck, FaTimes } from 'react-icons/fa';

// Import our new improved components
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';
import ImprovedVivaBucksDisplay from '@/components/loyalty/components/ImprovedVivaBucksDisplay';

export default function TestLoyaltyV2Page() {
  const { data: session } = useSession();
  const [testAmount, setTestAmount] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // info, success, error

  // Use the new improved loyalty store
  const {
    userData,
    progressInfo,
    isLoading: storeLoading,
    error,
    fetchUserData,
    addVivaBucksOptimistic,
    forceRefresh,
    getVivaBucksInfo
  } = useImprovedLoyaltyStore();

  // Initialize data on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session?.user?.id, fetchUserData]);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const testOptimisticUpdate = () => {
    if (!userData) {
      showMessage('No user data available', 'error');
      return;
    }

    const txId = addVivaBucksOptimistic(testAmount, 'test');
    showMessage(`Optimistic update: +${testAmount} VivaBucks (${txId})`, 'success');
  };

  const testApiUpdate = async () => {
    if (!session?.user?.id) {
      showMessage('Not authenticated', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/loyalty/add-vivabucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          vivaBucks: testAmount,
          source: 'test',
          metadata: { testPage: true }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      showMessage(`API Success: +${testAmount} VivaBucks added`, 'success');
      
      // Refresh data to see the update
      setTimeout(() => fetchUserData(true), 1000);
      
    } catch (error) {
      showMessage(`API Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    setIsLoading(true);
    try {
      await forceRefresh();
      showMessage('Data refreshed from server', 'success');
    } catch (error) {
      showMessage(`Refresh failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get VivaBucks info in unified format
  const vivaBucksInfo = getVivaBucksInfo();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">VivaBucks V2.0 Test Page</h1>
          <p className="text-gray-600">Please sign in to test the new loyalty system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg"
          >
            <FaRocket className="text-xl" />
            <span>VivaBucks 2.0 Test Suite</span>
          </motion.div>
          <p className="text-gray-600 mt-4">
            Testing the new simplified 3-tier system with unified VivaBucks model
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-lg border ${
              messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
              messageType === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              {messageType === 'success' && <FaCheck />}
              {messageType === 'error' && <FaTimes />}
              <span>{message}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: VivaBucks Display Components */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span>🎨 UI Components</span>
            </h2>

            {/* Banner Variant */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Banner Display</h3>
              <ImprovedVivaBucksDisplay 
                userData={userData}
                progressInfo={progressInfo}
                variant="banner"
                animated={true}
              />
            </div>

            {/* Card Variant */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Card Display</h3>
              <ImprovedVivaBucksDisplay 
                userData={userData}
                progressInfo={progressInfo}
                variant="card"
                showProgress={true}
              />
            </div>

            {/* Compact Variant */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Compact Display</h3>
              <div className="bg-white p-4 rounded-lg border">
                <ImprovedVivaBucksDisplay 
                  userData={userData}
                  progressInfo={progressInfo}
                  variant="compact"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Test Controls and Data */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FaCog />
              <span>Test Controls</span>
            </h2>

            {/* Test Amount Input */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-4">Test Amount</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(Number(e.target.value))}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter VivaBucks amount"
                  min="1"
                />
                <span className="text-sm text-gray-500">VivaBucks</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={testOptimisticUpdate}
                  disabled={!userData || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Test Optimistic Update
                </button>
                
                <button
                  onClick={testApiUpdate}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Test API Update'}
                </button>
                
                <button
                  onClick={handleForceRefresh}
                  disabled={isLoading}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FaSync className={isLoading ? 'animate-spin' : ''} />
                  <span>Force Refresh</span>
                </button>
              </div>
            </div>

            {/* Raw Data Display */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-4">Raw Data</h3>
              <div className="space-y-4">
                {/* Store State */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Store State</h4>
                  <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify({
                      isLoading: storeLoading,
                      isInitialized: useImprovedLoyaltyStore.getState().isInitialized,
                      error: error,
                      cacheTimestamp: useImprovedLoyaltyStore.getState().cacheTimestamp
                    }, null, 2)}
                  </pre>
                </div>

                {/* User Data */}
                {userData && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">User Data</h4>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(userData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* VivaBucks Info (Unified Format) */}
                {vivaBucksInfo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">VivaBucks Info (Unified)</h4>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(vivaBucksInfo, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Progress Info */}
                {progressInfo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Progress Info</h4>
                    <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(progressInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Data Format:</span>
                  <span className="font-medium text-green-600">v2.0 (Unified)</span>
                </div>
                <div className="flex justify-between">
                  <span>Tier System:</span>
                  <span className="font-medium text-blue-600">3-Tier (Simplified)</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Status:</span>
                  <span className={`font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
                    {error ? 'Error' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 