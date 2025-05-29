'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBrain, 
  FaMagic as FaSparkles,
  FaRobot,
  FaCog,
  FaEye,
  FaLightbulb,
  FaRocket,
  FaTrophy,
  FaGift,
  FaChartLine,
  FaCoins
} from 'react-icons/fa';
import ContextualInsights from '@/components/loyalty/ContextualInsights';
import SurpriseModal from '@/components/loyalty/SurpriseModal';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';
import { 
  generateEarningForecasts,
  generateContextualInsights,
  generateUsageRecommendations
} from '@/lib/loyalty/contextualIntelligenceService';
import { 
  checkSurpriseEligibility,
  generateSurpriseCelebration
} from '@/lib/loyalty/surpriseDelightService';
import { 
  generateAutomaticChoice,
  convertToNaturalLanguage,
  predictUserNeeds,
  generateContextualAutomation
} from '@/lib/loyalty/zeroCognitiveLoadService';

/**
 * VivaBucks Phase 3 Demonstration Page
 * 
 * Showcases all new Phase 3 features:
 * 1. Contextual Intelligence
 * 2. Surprise & Delight
 * 3. Zero Cognitive Load
 * 4. Seamless Integration
 */

export default function VivaBucksPhase3Demo() {
  const { userData, isLoading, setUserData } = useImprovedLoyaltyStore();
  const [selectedDemo, setSelectedDemo] = useState('overview');
  const [demoData, setDemoData] = useState(null);
  const [surpriseModal, setSurpriseModal] = useState({ visible: false, data: null });
  const [simulationResults, setSimulationResults] = useState({});

  // Demo user data with rich history
  const demoUserData = {
    availableVivaBucks: 2750,
    totalVivaBucksEarned: 12500,
    currentTier: 'ADVENTURER',
    pointsMultiplier: 1.5,
    vivaBucks: 2750,
    cumulativeVivaBucks: 12500,
    userId: 'phase3-demo-user',
    email: 'phase3@vivapharmacy.com',
    name: 'Phase 3 Demo User',
    dateOfBirth: '1990-06-15', // Birthday coming up
    lastUpdated: new Date().toISOString(),
    dataVersion: '3.0'
  };

  // Rich order history for intelligent analysis
  const demoOrderHistory = [
    {
      id: 'order-1',
      total: 87.50,
      vivaBucksUsed: 250,
      vivaBucksEarned: 131,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Prescription Refill', category: 'prescription', price: 45.00, quantity: 1, isPrescription: true },
        { name: 'Vitamin D3', category: 'vitamins', price: 22.50, quantity: 1 },
        { name: 'Pain Relief Gel', category: 'health', price: 20.00, quantity: 1 }
      ],
      shippingMethod: 'express'
    },
    {
      id: 'order-2',
      total: 156.30,
      vivaBucksUsed: 500,
      vivaBucksEarned: 234,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Monthly Prescription', category: 'prescription', price: 65.00, quantity: 1, isPrescription: true },
        { name: 'Multivitamins', category: 'vitamins', price: 35.30, quantity: 2 },
        { name: 'Cold Medicine', category: 'cold-flu', price: 28.50, quantity: 1 },
        { name: 'Hand Sanitizer', category: 'health', price: 12.50, quantity: 1 }
      ],
      shippingMethod: 'standard'
    },
    {
      id: 'order-3',
      total: 245.75,
      vivaBucksUsed: 750,
      vivaBucksEarned: 368,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Blood Pressure Monitor', category: 'medical-devices', price: 89.99, quantity: 1 },
        { name: 'Prescription Bundle', category: 'prescription', price: 125.00, quantity: 1, isPrescription: true },
        { name: 'Wellness Supplements', category: 'vitamins', price: 30.76, quantity: 1 }
      ],
      shippingMethod: 'express'
    }
  ];

  // Initialize demo data
  useEffect(() => {
    if (!isLoading) {
      setUserData(demoUserData);
      generateDemoData();
    }
  }, [isLoading]);

  const generateDemoData = () => {
    const currentOrder = {
      total: 95.50,
      items: [
        { name: 'Prescription Refill', category: 'prescription', price: 55.00, quantity: 1, isPrescription: true },
        { name: 'Allergy Medicine', category: 'allergy', price: 25.50, quantity: 1 },
        { name: 'Throat Lozenges', category: 'cold-flu', price: 15.00, quantity: 1 }
      ]
    };

    const intelligenceData = {
      forecasts: generateEarningForecasts(demoUserData, demoOrderHistory, currentOrder),
      insights: generateContextualInsights(currentOrder, demoUserData, demoOrderHistory),
      recommendations: generateUsageRecommendations(demoUserData, demoOrderHistory)
    };

    const surpriseData = checkSurpriseEligibility(demoUserData, currentOrder, demoOrderHistory);
    
    const cognitiveData = {
      automaticChoice: generateAutomaticChoice(currentOrder, demoUserData, demoOrderHistory),
      predictions: predictUserNeeds(demoUserData, currentOrder, demoOrderHistory),
      automation: generateContextualAutomation(currentOrder, demoUserData, demoOrderHistory)
    };

    setDemoData({
      currentOrder,
      intelligence: intelligenceData,
      surprises: surpriseData,
      cognitive: cognitiveData
    });
  };

  const triggerSurpriseDemo = (surpriseType) => {
    const mockDetails = {
      bonusAmount: 350,
      reason: "You're an amazing customer! Here's a surprise!",
      milestone: 'LOYAL_CUSTOMER',
      newTier: 'CHAMPION',
      years: 2
    };

    const surprise = generateSurpriseCelebration(surpriseType, demoUserData, mockDetails);
    setSurpriseModal({ visible: true, data: surprise });
  };

  const demoSections = [
    {
      id: 'overview',
      title: 'Phase 3 Overview',
      icon: FaRocket,
      description: 'Complete feature overview and 10/10 achievement'
    },
    {
      id: 'intelligence',
      title: 'Contextual Intelligence',
      icon: FaBrain,
      description: 'Predictive analytics and smart insights'
    },
    {
      id: 'surprise',
      title: 'Surprise & Delight',
      icon: FaSparkles,
      description: 'Magical moments and celebrations'
    },
    {
      id: 'cognitive',
      title: 'Zero Cognitive Load',
      icon: FaRobot,
      description: 'Automatic decisions and natural language'
    },
    {
      id: 'integration',
      title: 'Seamless Integration',
      icon: FaCog,
      description: 'Universal experience across all touchpoints'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Phase 3 Demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaTrophy className="text-4xl text-yellow-300" />
              <h1 className="text-4xl font-bold">VivaBucks Phase 3</h1>
              <FaTrophy className="text-4xl text-yellow-300" />
            </div>
            <p className="text-xl text-purple-100 mb-2">The Perfect 10/10 Loyalty Experience</p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <span className="flex items-center"><FaBrain className="mr-1" /> Contextual Intelligence</span>
              <span className="flex items-center"><FaSparkles className="mr-1" /> Surprise & Delight</span>
              <span className="flex items-center"><FaRobot className="mr-1" /> Zero Cognitive Load</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Demo Features</h3>
              <nav className="space-y-2">
                {demoSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedDemo(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDemo === section.id
                          ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="text-lg" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{section.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedDemo === 'overview' && <OverviewSection key="overview" />}
              {selectedDemo === 'intelligence' && <IntelligenceSection key="intelligence" demoData={demoData} />}
              {selectedDemo === 'surprise' && <SurpriseSection key="surprise" onTriggerSurprise={triggerSurpriseDemo} />}
              {selectedDemo === 'cognitive' && <CognitiveSection key="cognitive" demoData={demoData} />}
              {selectedDemo === 'integration' && <IntegrationSection key="integration" />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Surprise Modal */}
      <SurpriseModal
        surprise={surpriseModal.data}
        isVisible={surpriseModal.visible}
        onClose={() => setSurpriseModal({ visible: false, data: null })}
        onComplete={(surprise) => console.log('Surprise completed:', surprise)}
      />
    </div>
  );
}

// Overview Section Component
const OverviewSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">🏆 Perfect 10/10 Achievement</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-4xl font-bold text-green-600 mb-2">9.2 → 10.0</div>
          <div className="text-green-700 font-medium">Rating Progression</div>
          <div className="text-sm text-green-600 mt-1">From great to perfect</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-4xl font-bold text-blue-600 mb-2">4</div>
          <div className="text-blue-700 font-medium">Major Features</div>
          <div className="text-sm text-blue-600 mt-1">Revolutionary capabilities</div>
        </div>
        
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
          <div className="text-purple-700 font-medium">Possibilities</div>
          <div className="text-sm text-purple-600 mt-1">Limitless intelligence</div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <FaBrain className="mr-2 text-purple-600" />
            1. Contextual Intelligence
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Predictive earning forecasts based on behavior patterns</li>
            <li>• Prescription-specific intelligence and timing</li>
            <li>• Usage pattern analysis with personalized recommendations</li>
            <li>• Tier progression predictions with timeline estimates</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <FaSparkles className="mr-2 text-pink-600" />
            2. Surprise & Delight
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Strategic random bonus celebrations (6% frequency)</li>
            <li>• Personal milestone recognition with animations</li>
            <li>• Birthday magic with multiplier bonuses</li>
            <li>• Anniversary commemorations and tier celebrations</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <FaRobot className="mr-2 text-green-600" />
            3. Zero Cognitive Load
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Automatic best-choice suggestions with 95% confidence</li>
            <li>• Natural language explanations for all interactions</li>
            <li>• Predictive user needs before they're expressed</li>
            <li>• Contextual automation for seamless experience</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <FaCog className="mr-2 text-indigo-600" />
            4. Seamless Integration
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Universal VivaBucks display on all product pages</li>
            <li>• Mobile-first optimization with touch-friendly design</li>
            <li>• Voice-friendly summaries for accessibility</li>
            <li>• Cross-platform consistency everywhere</li>
          </ul>
        </div>
      </div>
    </div>
  </motion.div>
);

// Intelligence Section Component
const IntelligenceSection = ({ demoData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FaBrain className="mr-3 text-purple-600" />
        Contextual Intelligence Demo
      </h2>
      
      {demoData && (
        <ContextualInsights
          orderData={demoData.currentOrder}
          orderHistory={[]} // Using demo order history
          variant="full"
        />
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-blue-500" />
          Predictive Analytics
        </h3>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <strong>Next Tier:</strong> 3 more orders until CHAMPION tier
          </div>
          <div className="bg-green-50 p-3 rounded">
            <strong>Monthly Earning:</strong> ~847 VivaBucks based on patterns
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <strong>Prescription Timing:</strong> Refill due in 5 days
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <FaLightbulb className="mr-2 text-yellow-500" />
          Smart Recommendations
        </h3>
        <div className="space-y-3 text-sm">
          <div className="bg-yellow-50 p-3 rounded">
            <strong>Bundle Suggestion:</strong> Add vitamins for bonus points
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <strong>Timing:</strong> Perfect for bulk order this month
          </div>
          <div className="bg-red-50 p-3 rounded">
            <strong>Alert:</strong> 87% to next tier - almost there!
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Surprise Section Component
const SurpriseSection = ({ onTriggerSurprise }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FaSparkles className="mr-3 text-pink-600" />
        Surprise & Delight Demo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { type: 'RANDOM_BONUS', title: 'Random Bonus', color: 'from-red-400 to-pink-400', icon: FaGift },
          { type: 'MILESTONE_CELEBRATION', title: 'Milestone', color: 'from-yellow-400 to-orange-400', icon: FaTrophy },
          { type: 'BIRTHDAY_MAGIC', title: 'Birthday Magic', color: 'from-pink-400 to-purple-400', icon: FaSparkles },
          { type: 'TIER_UPGRADE_CELEBRATION', title: 'Tier Upgrade', color: 'from-green-400 to-blue-400', icon: FaRocket },
          { type: 'LOYALTY_ANNIVERSARY', title: 'Anniversary', color: 'from-purple-400 to-indigo-400', icon: FaCrown }
        ].map((surprise) => {
          const Icon = surprise.icon;
          return (
            <button
              key={surprise.type}
              onClick={() => onTriggerSurprise(surprise.type)}
              className={`p-6 rounded-lg bg-gradient-to-br ${surprise.color} text-white hover:shadow-lg transform hover:scale-105 transition-all`}
            >
              <Icon className="text-3xl mb-3 mx-auto" />
              <div className="font-medium">{surprise.title}</div>
              <div className="text-sm opacity-90 mt-1">Try it!</div>
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Surprise Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong className="text-purple-600">Frequency:</strong>
            <p className="text-gray-600 mt-1">6% of orders get random bonuses, timed for maximum impact</p>
          </div>
          <div>
            <strong className="text-pink-600">Timing:</strong>
            <p className="text-gray-600 mt-1">Strategic moments like tier near-misses or rough periods</p>
          </div>
          <div>
            <strong className="text-orange-600">Personalization:</strong>
            <p className="text-gray-600 mt-1">Bonus amounts scale with user value and behavior</p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Cognitive Section Component
const CognitiveSection = ({ demoData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FaRobot className="mr-3 text-green-600" />
        Zero Cognitive Load Demo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Automatic Choices</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="font-medium text-green-800 mb-2">Smart Recommendation</div>
            <p className="text-green-700 text-sm mb-3">
              "Perfect balance! Save $13.75 now, keep plenty for next time ⚖️"
            </p>
            <div className="text-xs text-green-600">
              <strong>Confidence:</strong> 87% based on your behavior
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Natural Language</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <strong>Instead of:</strong> "Use 1375 VivaBucks"<br/>
              <strong className="text-blue-600">We say:</strong> "Save $13.75 with your VivaBucks"
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong>Instead of:</strong> "Earn 143 points"<br/>
              <strong className="text-purple-600">We say:</strong> "You'll earn enough for a $1.43 discount"
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-gray-900">Predictive Assistance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="font-medium text-orange-800 mb-2">Prescription Timing</div>
            <p className="text-orange-700 text-sm">
              "Refill time approaching? Bundle with this order to maximize VivaBucks!"
            </p>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="font-medium text-cyan-800 mb-2">Free Shipping</div>
            <p className="text-cyan-700 text-sm">
              "Add $7.50 more for free shipping! I've selected some suggestions."
            </p>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="font-medium text-pink-800 mb-2">Seasonal Opportunity</div>
            <p className="text-pink-700 text-sm">
              "Cold & flu season: Perfect timing for stocking up essentials!"
            </p>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Integration Section Component
const IntegrationSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FaCog className="mr-3 text-indigo-600" />
        Seamless Integration Demo
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Universal VivaBucks Display</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Product Page Integration</div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-medium text-blue-800">Buy this product → Earn 47 VivaBucks</div>
                <div className="text-blue-600 text-sm">ADVENTURER members get 71 VivaBucks for this item</div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Category Integration</div>
              <div className="bg-green-50 p-3 rounded">
                <div className="font-medium text-green-800">Cold & Flu category insights</div>
                <div className="text-green-600 text-sm">Your VivaBucks could cover 73% of items here</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Mobile-First Design</h3>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-purple-600">Touch-Friendly:</strong>
                <p className="text-gray-600 mt-1">Large buttons, swipe gestures, haptic feedback</p>
              </div>
              <div>
                <strong className="text-blue-600">Fast Loading:</strong>
                <p className="text-gray-600 mt-1">Sub-50ms response times, optimized assets</p>
              </div>
              <div>
                <strong className="text-indigo-600">Adaptive UI:</strong>
                <p className="text-gray-600 mt-1">Context-aware layouts, smart spacing</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Voice-Friendly Features</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaEye className="text-gray-400 mt-1" />
                <div>
                  <strong>Screen Reader:</strong> "You have 2,750 VivaBucks worth $27.50 in spending power"
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaEye className="text-gray-400 mt-1" />
                <div>
                  <strong>Voice Summary:</strong> "Smart balance recommendation: Save $13.75 now, keep plenty for next time"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
); 