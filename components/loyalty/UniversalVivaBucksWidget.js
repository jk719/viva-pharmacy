'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, 
  FaGift, 
  FaChartLine, 
  FaEye,
  FaArrowUp,
  FaTrophy,
  FaMagic as FaSparkles,
  FaInfoCircle
} from 'react-icons/fa';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';
import { 
  generateEarningForecasts,
  generateContextualInsights 
} from '@/lib/loyalty/contextualIntelligenceService';
import { checkSurpriseEligibility } from '@/lib/loyalty/surpriseDelightService';

/**
 * Universal VivaBucks Widget - Phase 3 Implementation
 * 
 * Seamless integration component that appears on:
 * 1. Product pages - showing earning potential
 * 2. Category pages - displaying tier benefits
 * 3. Cart page - smart redemption hints
 * 4. Checkout - contextual reminders
 * 5. Profile areas - progress tracking
 * 
 * Features:
 * - Context-aware messaging
 * - Predictive earning displays
 * - Tier progression hints
 * - Mobile-optimized design
 * - Non-intrusive positioning
 */

const UniversalVivaBucksWidget = ({ 
  context = 'product', // 'product', 'category', 'cart', 'checkout', 'profile'
  productData = null,
  orderData = null,
  position = 'floating', // 'floating', 'inline', 'sidebar'
  size = 'medium', // 'small', 'medium', 'large'
  autoHide = true,
  className = ''
}) => {
  const { userData, isLoading } = useImprovedLoyaltyStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-hide logic for non-intrusive experience
  useEffect(() => {
    if (!autoHide) return;

    const timer = setTimeout(() => {
      if (!isExpanded) {
        setIsVisible(false);
      }
    }, 15000); // Hide after 15 seconds if not expanded

    return () => clearTimeout(timer);
  }, [autoHide, isExpanded]);

  // Generate contextual data when context or data changes
  useEffect(() => {
    if (!userData || isLoading) return;

    const generateContextualData = async () => {
      try {
        const mockOrder = orderData || createMockOrderFromContext(context, productData);
        
        const [newInsights, newForecasts] = await Promise.all([
          generateContextualInsights(mockOrder, userData, []),
          generateEarningForecasts(userData, [], mockOrder)
        ]);

        setInsights(newInsights);
        setForecasts(newForecasts);
        setAnimationKey(prev => prev + 1);
      } catch (error) {
        console.error('[UniversalWidget] Failed to generate data:', error);
      }
    };

    generateContextualData();
  }, [context, productData, orderData, userData, isLoading]);

  if (isLoading || !userData || !isVisible) return null;

  const content = getContextualContent(context, productData, orderData, userData, insights, forecasts);
  if (!content) return null;

  const sizeClasses = getSizeClasses(size);
  const positionClasses = getPositionClasses(position);

  return (
    <AnimatePresence>
      <motion.div
        key={animationKey}
        initial={{ opacity: 0, scale: 0.9, y: position === 'floating' ? 20 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: position === 'floating' ? 20 : 0 }}
        transition={{ duration: 0.4, ease: "backOut" }}
        className={`
          ${positionClasses}
          ${sizeClasses}
          ${className}
          bg-white rounded-lg shadow-lg border border-gray-200 
          hover:shadow-xl transition-all duration-300
        `}
        style={{
          zIndex: position === 'floating' ? 'var(--z-floating-widget)' : 'auto'
        }}
      >
        {/* Main Widget Content */}
        <div 
          className={`p-4 cursor-pointer ${isExpanded ? '' : 'hover:bg-gray-50'}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            {/* Left: Main Content */}
            <div className="flex items-center space-x-3">
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${content.iconBg || 'bg-gradient-to-br from-purple-400 to-blue-400'}
              `}>
                {content.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-gray-900 ${size === 'small' ? 'text-sm' : 'text-base'}`}>
                  {content.title}
                </div>
                <div className={`text-gray-600 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                  {content.subtitle}
                </div>
              </div>
            </div>

            {/* Right: Action/Value */}
            <div className="flex items-center space-x-2">
              {content.value && (
                <div className={`text-right ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                  <div className="font-bold text-green-600">{content.value}</div>
                  {content.subvalue && (
                    <div className="text-gray-500 text-xs">{content.subvalue}</div>
                  )}
                </div>
              )}
              
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400"
              >
                <FaArrowUp className="w-4 h-4" />
              </motion.div>
            </div>
          </div>

          {/* Progress Bar (if applicable) */}
          {content.progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{content.progress.label}</span>
                <span>{content.progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${content.progress.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-2 rounded-full ${content.progress.color || 'bg-gradient-to-r from-purple-400 to-blue-400'}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="p-4 bg-gray-50">
                {content.expandedContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close Button for Floating Widget */}
        {position === 'floating' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700 transition-colors"
          >
            ×
          </button>
        )}

        {/* Contextual Notifications */}
        {content.notification && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-1 -right-1"
          >
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Helper Functions

const createMockOrderFromContext = (context, productData) => {
  switch (context) {
    case 'product':
      return productData ? {
        total: productData.price || 25,
        items: [{ ...productData, quantity: 1 }]
      } : { total: 25, items: [] };
    
    case 'category':
      return { total: 45, items: [] }; // Average category browsing order
    
    case 'cart':
    case 'checkout':
      return { total: 75, items: [] }; // Average cart value
    
    default:
      return { total: 35, items: [] };
  }
};

const getContextualContent = (context, productData, orderData, userData, insights, forecasts) => {
  const availableVivaBucks = userData.availableVivaBucks || 0;
  const currentTier = userData.currentTier || 'EXPLORER';

  switch (context) {
    case 'product':
      return getProductPageContent(productData, userData, forecasts);
    
    case 'category':
      return getCategoryPageContent(userData, insights);
    
    case 'cart':
      return getCartPageContent(orderData, userData, availableVivaBucks);
    
    case 'checkout':
      return getCheckoutPageContent(orderData, userData, availableVivaBucks);
    
    case 'profile':
      return getProfilePageContent(userData, forecasts);
    
    default:
      return null;
  }
};

const getProductPageContent = (productData, userData, forecasts) => {
  const productPrice = productData?.price || 25;
  const earning = Math.round(productPrice * (userData.pointsMultiplier || 1));
  
  return {
    icon: <FaCoins className="text-yellow-400 text-lg" />,
    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-400',
    title: `Earn ${earning} VivaBucks`,
    subtitle: `Worth $${(earning * 0.01).toFixed(2)} toward future purchases`,
    value: `+${earning}`,
    subvalue: 'VivaBucks',
    progress: userData.currentTier !== 'CHAMPION' ? {
      label: `Progress to ${getNextTier(userData.currentTier)}`,
      percentage: calculateTierProgress(userData),
      color: 'bg-gradient-to-r from-purple-400 to-pink-400'
    } : null,
    expandedContent: (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Base earning:</span>
          <span className="font-medium">+{Math.round(productPrice)} VivaBucks</span>
        </div>
        {userData.pointsMultiplier > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{userData.currentTier} bonus:</span>
            <span className="font-medium text-purple-600">×{userData.pointsMultiplier}</span>
          </div>
        )}
        <div className="text-xs text-gray-500 pt-2 border-t">
          💡 Prescription orders earn bonus VivaBucks this month!
        </div>
      </div>
    )
  };
};

const getCategoryPageContent = (userData, insights) => {
  const availableVivaBucks = userData.availableVivaBucks || 0;
  
  return {
    icon: <FaGift className="text-purple-400 text-lg" />,
    iconBg: 'bg-gradient-to-br from-purple-400 to-indigo-400',
    title: `${availableVivaBucks.toLocaleString()} VivaBucks`,
    subtitle: `Ready to use - worth $${(availableVivaBucks * 0.01).toFixed(2)}`,
    value: `$${(availableVivaBucks * 0.01).toFixed(2)}`,
    subvalue: 'savings ready',
    expandedContent: (
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          🔍 Browse products and see earning potential on each item
        </div>
        <div className="text-sm text-gray-600">
          💳 Your {userData.currentTier} tier gets {userData.pointsMultiplier}x earning on all purchases
        </div>
        {insights && insights.length > 0 && (
          <div className="text-xs text-purple-600 pt-2 border-t">
            💡 {insights[0].message}
          </div>
        )}
      </div>
    )
  };
};

const getCartPageContent = (orderData, userData, availableVivaBucks) => {
  const orderTotal = orderData?.total || 0;
  const potentialSavings = Math.min(availableVivaBucks * 0.01, orderTotal);
  
  if (potentialSavings < 1) {
    return {
      icon: <FaChartLine className="text-blue-400 text-lg" />,
      iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-400',
      title: `Earn ${Math.round(orderTotal * (userData.pointsMultiplier || 1))} VivaBucks`,
      subtitle: 'From this order',
      value: `+${Math.round(orderTotal * (userData.pointsMultiplier || 1))}`,
      subvalue: 'VivaBucks',
      expandedContent: (
        <div className="text-sm text-gray-600">
          💡 Add more items to unlock VivaBucks redemption options
        </div>
      )
    };
  }

  return {
    icon: <FaCoins className="text-green-400 text-lg" />,
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-400',
    title: `Save $${potentialSavings.toFixed(2)}`,
    subtitle: `Use ${Math.round(potentialSavings * 100)} VivaBucks`,
    value: `-$${potentialSavings.toFixed(2)}`,
    subvalue: 'potential savings',
    expandedContent: (
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          💰 Smart suggestion: Use {Math.round(potentialSavings * 100)} VivaBucks
        </div>
        <div className="text-xs text-gray-500">
          You'll still earn {Math.round(orderTotal * (userData.pointsMultiplier || 1))} VivaBucks from this order
        </div>
      </div>
    )
  };
};

const getCheckoutPageContent = (orderData, userData, availableVivaBucks) => {
  const orderTotal = orderData?.total || 0;
  const recommendedUse = Math.min(availableVivaBucks * 0.5, orderTotal * 10); // Use 50% of available
  
  return {
    icon: <FaSparkles className="text-purple-400 text-lg" />,
    iconBg: 'bg-gradient-to-br from-purple-400 to-pink-400',
    title: 'VivaBucks Ready',
    subtitle: `${availableVivaBucks.toLocaleString()} available`,
    value: `${availableVivaBucks.toLocaleString()}`,
    subvalue: 'VivaBucks',
    notification: recommendedUse > 0,
    expandedContent: (
      <div className="space-y-2">
        {recommendedUse > 0 ? (
          <div className="text-sm text-purple-600">
            💡 Smart suggestion: Use {Math.round(recommendedUse)} VivaBucks to save ${(recommendedUse * 0.01).toFixed(2)}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            🔒 Save your VivaBucks for larger orders to maximize value
          </div>
        )}
        <div className="text-xs text-gray-500">
          VivaBucks never expire and grow with every purchase
        </div>
      </div>
    )
  };
};

const getProfilePageContent = (userData, forecasts) => {
  const totalEarned = userData.totalVivaBucksEarned || 0;
  const available = userData.availableVivaBucks || 0;
  
  return {
    icon: <FaTrophy className="text-gold-400 text-lg" />,
    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-400',
    title: `${userData.currentTier} Member`,
    subtitle: `${available.toLocaleString()} VivaBucks available`,
    value: `${totalEarned.toLocaleString()}`,
    subvalue: 'total earned',
    progress: userData.currentTier !== 'CHAMPION' ? {
      label: `Progress to ${getNextTier(userData.currentTier)}`,
      percentage: calculateTierProgress(userData),
      color: 'bg-gradient-to-r from-gold-400 to-yellow-400'
    } : null,
    expandedContent: (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current multiplier:</span>
          <span className="font-medium text-purple-600">×{userData.pointsMultiplier}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total value earned:</span>
          <span className="font-medium">${(totalEarned * 0.01).toFixed(2)}</span>
        </div>
        {forecasts && (
          <div className="text-xs text-purple-600 pt-2 border-t">
            📈 {forecasts.insights[0]?.message || 'Keep shopping to earn more!'}
          </div>
        )}
      </div>
    )
  };
};

const getSizeClasses = (size) => {
  switch (size) {
    case 'small':
      return 'max-w-xs';
    case 'large':
      return 'max-w-lg';
    case 'medium':
    default:
      return 'max-w-md';
  }
};

const getPositionClasses = (position) => {
  switch (position) {
    case 'floating':
      return 'fixed bottom-4 right-4';
    case 'sidebar':
      return 'sticky top-4';
    case 'inline':
    default:
      return 'relative';
  }
};

const getNextTier = (currentTier) => {
  const tiers = ['EXPLORER', 'ADVENTURER', 'CHAMPION'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : 'CHAMPION';
};

const calculateTierProgress = (userData) => {
  const totalEarned = userData.totalVivaBucksEarned || 0;
  const currentTier = userData.currentTier || 'EXPLORER';
  
  // Simplified tier thresholds
  const thresholds = {
    EXPLORER: { min: 0, max: 2500 },
    ADVENTURER: { min: 2500, max: 7500 },
    CHAMPION: { min: 7500, max: Infinity }
  };
  
  const threshold = thresholds[currentTier];
  if (!threshold || currentTier === 'CHAMPION') return 100;
  
  const progress = ((totalEarned - threshold.min) / (threshold.max - threshold.min)) * 100;
  return Math.min(100, Math.max(0, progress));
};

export default UniversalVivaBucksWidget; 