import Link from 'next/link';
import { useState } from 'react';
import { FaUser, FaCoins, FaShoppingBag, FaGift, FaTrophy, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';
import { TIER_COLORS } from '@/components/loyalty/constants/tierConfig';
import TierPointsDisplay from '@/components/loyalty/components/TierPointsDisplay';
import LoyaltyProgressBar from '@/components/loyalty/LoyaltyProgressBar';
import useLoyaltyData from '@/components/loyalty/hooks/useLoyaltyData';

export default function RewardsPageContent() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'history', 'rewards'

  // Use the shared loyalty data hook
  const { userData, progressInfo, isLoading } = useLoyaltyData();

  // Don't render full content while loading
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <FaCoins className="text-[#FF6B00]" size={32} />
          </div>
          <p className="text-gray-600">Loading your VivaBucks rewards...</p>
        </div>
      </div>
    );
  }

  // Get current loyalty points and tier from userData
  const currentPoints = userData.vivaBucks || 0;
  const cumulativePoints = userData.cumulativePoints || 0;
  const currentTier = userData.currentTier || 'BRONZE';
  const pointsMultiplier = userData.pointsMultiplier || 1;
  const rewardHistory = userData.rewardHistory || [];
  
  // Extract values from the progress info
  const nextTierKey = progressInfo?.nextTier || null;
  const pointsToNextTier = progressInfo?.pointsNeeded || 0;
  const progressPercentage = progressInfo?.progress || 0;
  const startPoints = progressInfo?.startPoints || 0;
  const endPoints = progressInfo?.endPoints || 0;

  // Generate dummy tier benefits for display purposes
  const tierBenefits = {
    BRONZE: [
      'Earn 1x points on all purchases',
      'Access to exclusive promotions',
      'Birthday rewards'
    ],
    SILVER: [
      'Earn 1.25x points on all purchases',
      'Free standard shipping on orders over $35',
      '$5 quarterly reward certificate',
      'All Bronze benefits'
    ],
    GOLD: [
      'Earn 1.5x points on all purchases',
      'Free standard shipping on orders over $25',
      '$10 quarterly reward certificate',
      'Early access to sales',
      'All Silver benefits'
    ],
    PLATINUM: [
      'Earn 1.75x points on all purchases',
      'Free standard shipping on all orders',
      '$20 quarterly reward certificate',
      'Priority customer service',
      'All Gold benefits'
    ],
    SAPPHIRE: [
      'Earn 2x points on all purchases',
      'Free expedited shipping on all orders',
      '$30 quarterly reward certificate',
      'Exclusive promotions and offers',
      'All Platinum benefits'
    ],
    DIAMOND: [
      'Earn 2x points on all purchases',
      'Free expedited shipping on all orders',
      '$40 quarterly reward certificate',
      'VIP phone support',
      'All Sapphire benefits'
    ],
    LEGEND: [
      'Earn 2.25x points on all purchases',
      'Free overnight shipping on all orders',
      '$50 quarterly reward certificate',
      'Personal shopping assistant',
      'All Diamond benefits'
    ]
  };

  // Create sample redemption options
  const redemptionOptions = [
    { id: 1, name: '$5 off your next purchase', pointsCost: 500, description: 'Receive $5 off on your next order at Viva Pharmacy.' },
    { id: 2, name: '$10 off your next purchase', pointsCost: 1000, description: 'Receive $10 off on your next order at Viva Pharmacy.' },
    { id: 3, name: '$25 off your next purchase', pointsCost: 2500, description: 'Receive $25 off on your next order at Viva Pharmacy.' },
    { id: 4, name: 'Free standard shipping', pointsCost: 300, description: 'Get free standard shipping on your next order, regardless of order value.' },
    { id: 5, name: 'Premium product sample', pointsCost: 750, description: 'Receive a premium product sample with your next order.' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 mb-6">
          Your VivaBucks rewards and loyalty program benefits
        </p>
        
        {/* Navigation tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <Link
              href="/profile"
              className="relative inline-flex items-center px-6 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 rounded-l-md"
            >
              <FaUser className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/profile/rewards"
              className="relative inline-flex items-center px-6 py-3 bg-[#0F2D5C] text-sm font-medium text-white focus:z-10"
            >
              <FaCoins className="mr-2 h-4 w-4" />
              VivaBucks
            </Link>
            <Link
              href="/profile/orders"
              className="relative inline-flex items-center px-6 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 rounded-r-md"
            >
              <FaShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </Link>
          </div>
        </div>

        {/* Content tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-[#0F2D5C] border-b-2 border-[#0F2D5C]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'redeem'
                ? 'text-[#0F2D5C] border-b-2 border-[#0F2D5C]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Redeem Rewards
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'history'
                ? 'text-[#0F2D5C] border-b-2 border-[#0F2D5C]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity History
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Summary cards */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Points */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-blue-50 p-2">
                      <FaCoins className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Current VivaBucks</h3>
                  </div>
                  <div className="mt-2">
                    <div className="text-3xl font-bold text-gray-900">{currentPoints.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mt-1">Available to spend</p>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => setActiveTab('redeem')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0F2D5C] hover:bg-[#0A1F3F] focus:outline-none"
                    >
                      <FaGift className="mr-2 h-4 w-4" />
                      Redeem Rewards
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Tier */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-amber-50 p-2">
                      <FaTrophy className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Current Tier</h3>
                  </div>
                  
                  <div className="flex mt-2 mb-4">
                    <TierPointsDisplay 
                      currentTier={currentTier}
                      points={currentPoints}
                      multiplier={pointsMultiplier}
                      showBadges={false}
                    />
                  </div>
                  
                  {nextTierKey && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress to {nextTierKey}</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {pointsToNextTier.toLocaleString()} points needed
                        </span>
                      </div>
                      
                      <LoyaltyProgressBar
                        currentPoints={cumulativePoints}
                        startPoints={startPoints}
                        endPoints={endPoints}
                        animate={false}
                        variant="compact"
                        label={`Progress to ${nextTierKey}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-green-50 p-2">
                      <FaChartLine className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Activity Summary</h3>
                  </div>
                  <div className="mt-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {rewardHistory.length || 0}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Total reward activities</p>
                  </div>
                  <div className="mt-4">
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      View Activity History
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Benefits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 bg-[#F7FAFF] border-b border-gray-200">
                <h2 className="text-lg font-medium text-[#0F2D5C]">{currentTier} Tier Benefits</h2>
                <p className="text-sm text-gray-500">Your current loyalty program benefits</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {tierBenefits[currentTier]?.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{benefit}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {nextTierKey && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 bg-[#F7FAFF] border-b border-gray-200">
                  <h2 className="text-lg font-medium text-[#0F2D5C]">Next Tier: {nextTierKey}</h2>
                  <p className="text-sm text-gray-500">Unlock these benefits by earning {pointsToNextTier.toLocaleString()} more points</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {tierBenefits[nextTierKey]?.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-500">{benefit}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Redeem Rewards Tab */}
        {activeTab === 'redeem' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-[#F7FAFF] border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-[#0F2D5C]">Redeem Your VivaBucks</h2>
                  <p className="text-sm text-gray-500">Choose a reward to redeem with your points</p>
                </div>
                <div className="bg-[#0F2D5C] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentPoints.toLocaleString()} points available
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {redemptionOptions.map((option) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{option.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-[#0F2D5C]">{option.pointsCost} points</span>
                        <button 
                          disabled={currentPoints < option.pointsCost}
                          className={`mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                            currentPoints >= option.pointsCost
                              ? 'text-white bg-[#0F2D5C] hover:bg-[#0A1F3F]'
                              : 'text-gray-500 bg-gray-100 cursor-not-allowed'
                          }`}
                        >
                          {currentPoints >= option.pointsCost ? 'Redeem' : 'Not enough points'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-[#F7FAFF] border-b border-gray-200">
              <h2 className="text-lg font-medium text-[#0F2D5C]">Reward Activity History</h2>
              <p className="text-sm text-gray-500">View your past reward transactions</p>
            </div>
            <div className="p-6">
              {rewardHistory && rewardHistory.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {rewardHistory.map((activity, index) => (
                    <div key={index} className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{activity.type || 'Points Transaction'}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.date || Date.now()).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className={`text-sm font-medium ${
                          (activity.points || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(activity.points || 0) >= 0 ? '+' : ''}{activity.points || 0} points
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't earned or redeemed any rewards yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 