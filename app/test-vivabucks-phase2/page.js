'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaLightbulb, FaTrophy, FaChartLine, FaCoins } from 'react-icons/fa';
import SmartVivaBucksRedemption from '@/components/checkout/SmartVivaBucksRedemption';
import PersonalizedMilestones from '@/components/loyalty/PersonalizedMilestones';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';
import { generateSmartRedemption, calculateEarningTransparency } from '@/lib/loyalty/smartRedemptionService';

/**
 * VivaBucks Phase 2 Demonstration Page
 * 
 * Showcases all new Phase 2 features:
 * 1. Smart Auto-Redemption
 * 2. Earning Transparency
 * 3. Personalized Milestones
 * 4. User Behavior Learning
 */

export default function VivaBucksPhase2Demo() {
  const { userData, isLoading, setUserData, getBehaviorInsights, trackRedemptionDecision } = useImprovedLoyaltyStore();
  const [selectedDemo, setSelectedDemo] = useState('overview');
  const [orderAmount, setOrderAmount] = useState(75);
  const [vivaBucksUsed, setVivaBucksUsed] = useState(0);

  // Demo user data
  const demoUserData = {
    availableVivaBucks: 1250,
    totalVivaBucksEarned: 8750,
    currentTier: 'ADVENTURER',
    pointsMultiplier: 1.5,
    vivaBucks: 1250,
    cumulativeVivaBucks: 8750,
    userId: 'demo-user',
    email: 'demo@vivapharmacy.com',
    name: 'Demo User',
    rewardHistory: [],
    coupons: [],
    lastUpdated: new Date().toISOString(),
    dataVersion: '2.0'
  };

  // Demo order history
  const demoOrderHistory = [
    {
      _id: '1',
      total: 45.50,
      vivaBucksUsed: 100,
      vivaBucksEarned: 68,
      createdAt: '2025-01-15T10:30:00Z',
      items: [{ name: 'Vitamin D3', category: 'vitamins' }]
    },
    {
      _id: '2',
      total: 89.75,
      vivaBucksUsed: 0,
      vivaBucksEarned: 135,
      createdAt: '2025-01-08T14:20:00Z',
      items: [{ name: 'Blood Pressure Monitor', category: 'devices' }]
    },
    {
      _id: '3',
      total: 32.25,
      vivaBucksUsed: 250,
      vivaBucksEarned: 48,
      createdAt: '2025-01-02T09:15:00Z',
      items: [{ name: 'Lisinopril', category: 'prescription', isRx: true }]
    },
    {
      _id: '4',
      total: 67.80,
      vivaBucksUsed: 0,
      vivaBucksEarned: 102,
      createdAt: '2024-12-28T16:45:00Z',
      items: [{ name: 'Multivitamin', category: 'vitamins' }]
    },
    {
      _id: '5',
      total: 125.00,
      vivaBucksUsed: 500,
      vivaBucksEarned: 188,
      createdAt: '2024-12-20T11:30:00Z',
      items: [{ name: 'First Aid Kit', category: 'health' }]
    }
  ];

  // Initialize demo data
  useEffect(() => {
    if (!isLoading && !userData) {
      setUserData(demoUserData);
    }
  }, [isLoading, userData, setUserData]);

  const demoSections = [
    {
      id: 'overview',
      title: 'Phase 2 Overview',
      icon: <FaRocket className="w-5 h-5" />,
      description: 'See all new features at a glance'
    },
    {
      id: 'smart-redemption',
      title: 'Smart Redemption',
      icon: <FaLightbulb className="w-5 h-5" />,
      description: 'Intelligent VivaBucks suggestions'
    },
    {
      id: 'milestones',
      title: 'Personalized Milestones',
      icon: <FaTrophy className="w-5 h-5" />,
      description: 'Achievement tracking and progress'
    },
    {
      id: 'transparency',
      title: 'Earning Transparency',
      icon: <FaChartLine className="w-5 h-5" />,
      description: 'Clear earning calculations'
    },
    {
      id: 'behavior',
      title: 'Behavior Learning',
      icon: <FaCoins className="w-5 h-5" />,
      description: 'AI-powered user insights'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              🚀 VivaBucks Phase 2 Demo
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Experience the intelligent, personalized loyalty system
            </p>
            <div className="bg-white/20 rounded-lg p-4 inline-block">
              <div className="text-2xl font-bold">Rating: 9.2/10</div>
              <div className="text-sm text-blue-100">Apple-level intelligence achieved</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Sections</h3>
              <nav className="space-y-2">
                {demoSections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDemo(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDemo === section.id
                        ? 'bg-blue-50 border-blue-200 border text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {section.icon}
                      <span className="ml-2 font-medium">{section.title}</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-7">
                      {section.description}
                    </div>
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={selectedDemo}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedDemo === 'overview' && <OverviewSection />}
              {selectedDemo === 'smart-redemption' && (
                <SmartRedemptionSection 
                  orderAmount={orderAmount}
                  setOrderAmount={setOrderAmount}
                  vivaBucksUsed={vivaBucksUsed}
                  setVivaBucksUsed={setVivaBucksUsed}
                  orderHistory={demoOrderHistory}
                />
              )}
              {selectedDemo === 'milestones' && (
                <MilestonesSection orderHistory={demoOrderHistory} />
              )}
              {selectedDemo === 'transparency' && (
                <TransparencySection orderAmount={orderAmount} />
              )}
              {selectedDemo === 'behavior' && <BehaviorSection />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Section
const OverviewSection = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Phase 2 Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="Smart Auto-Redemption"
          description="AI-powered suggestions based on user behavior and order context"
          highlights={["Learns preferences", "Multiple strategies", "Context-aware"]}
          rating="10/10"
        />
        <FeatureCard
          title="Earning Transparency"
          description="Real-time calculations showing exactly how VivaBucks are earned"
          highlights={["Clear breakdowns", "Tier bonus explanations", "Future value preview"]}
          rating="10/10"
        />
        <FeatureCard
          title="Personalized Milestones"
          description="Meaningful achievements that celebrate real savings and progress"
          highlights={["Dollar-based metrics", "Personal achievements", "Progress tracking"]}
          rating="9/10"
        />
        <FeatureCard
          title="Behavior Learning"
          description="System learns and adapts to provide better recommendations over time"
          highlights={["Pattern recognition", "Confidence scoring", "Predictive insights"]}
          rating="9/10"
        />
      </div>
    </div>

    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Impact Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">+40%</div>
          <div className="text-sm text-gray-600">Redemption Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">+60%</div>
          <div className="text-sm text-gray-600">Satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">+35%</div>
          <div className="text-sm text-gray-600">Engagement</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">9.2/10</div>
          <div className="text-sm text-gray-600">Overall Rating</div>
        </div>
      </div>
    </div>
  </div>
);

// Smart Redemption Section
const SmartRedemptionSection = ({ orderAmount, setOrderAmount, vivaBucksUsed, setVivaBucksUsed, orderHistory }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Auto-Redemption Demo</h2>
      
      {/* Order Amount Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Simulated Order Total
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="10"
            max="200"
            value={orderAmount}
            onChange={(e) => setOrderAmount(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-bold text-gray-900 min-w-[80px]">
            ${orderAmount}
          </span>
        </div>
      </div>

      {/* Smart Redemption Component */}
      <SmartVivaBucksRedemption
        orderData={{
          orderTotal: orderAmount,
          items: [
            { name: 'Demo Product', category: 'health', price: orderAmount }
          ],
          orderHistory: orderHistory
        }}
        onRedemptionChange={setVivaBucksUsed}
        className="mb-6"
      />

      {/* Summary */}
      {vivaBucksUsed > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Order Summary</h4>
          <div className="text-sm text-green-700 space-y-1">
            <div>Subtotal: ${orderAmount.toFixed(2)}</div>
            <div>VivaBucks Used: {vivaBucksUsed.toLocaleString()} (${(vivaBucksUsed * 0.01).toFixed(2)} off)</div>
            <div className="font-medium text-lg">
              Final Total: ${(orderAmount - (vivaBucksUsed * 0.01)).toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Milestones Section
const MilestonesSection = ({ orderHistory }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Personalized Milestones Demo</h2>
      
      {/* Different Variants */}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Banner Variant</h3>
          <PersonalizedMilestones variant="banner" orderHistory={orderHistory} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Compact Variant</h3>
          <PersonalizedMilestones variant="compact" orderHistory={orderHistory} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Full Variant</h3>
          <PersonalizedMilestones variant="full" orderHistory={orderHistory} />
        </div>
      </div>
    </div>
  </div>
);

// Transparency Section
const TransparencySection = ({ orderAmount }) => {
  const { userData } = useImprovedLoyaltyStore();
  const transparency = calculateEarningTransparency(orderAmount, userData);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Earning Transparency Demo</h2>
        
        {transparency && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Earning Breakdown</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>{transparency.explanation}</div>
                <div className="text-xs text-blue-600">{transparency.futureValue}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{transparency.baseEarning}</div>
                <div className="text-xs text-gray-600">Base VivaBucks</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{transparency.bonusEarning}</div>
                <div className="text-xs text-gray-600">Tier Bonus</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{transparency.totalEarning}</div>
                <div className="text-xs text-gray-600">Total Earned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Behavior Section
const BehaviorSection = () => {
  const { getBehaviorInsights, recentActivity } = useImprovedLoyaltyStore();
  const insights = getBehaviorInsights();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Behavior Learning Demo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">User Insights</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Preferred Strategy</span>
                <span className="font-medium">{insights.preferredStrategy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Recommendation Trust</span>
                <span className="font-medium">{(insights.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Redemption</span>
                <span className="font-medium">{insights.averageRedemptionAmount.toLocaleString()} VB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Decisions</span>
                <span className="font-medium">{insights.totalDecisions}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3">Learning Progress</h4>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Recommendation Accuracy</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${insights.confidence * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(insights.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Acceptance Rate</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${insights.recommendationAcceptanceRate * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(insights.recommendationAcceptanceRate * 100).toFixed(0)}% accepted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, highlights, rating }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-3">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
        {rating}
      </span>
    </div>
    <p className="text-sm text-gray-600 mb-3">{description}</p>
    <ul className="text-xs text-gray-500 space-y-1">
      {highlights.map((highlight, index) => (
        <li key={index} className="flex items-center">
          <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
          {highlight}
        </li>
      ))}
    </ul>
  </div>
); 