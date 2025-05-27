'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaLightbulb, FaChartLine, FaStar, FaTrophy, FaArrowUp, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { generateSmartRedemption, calculateQuickRedemption, calculateEarningTransparency } from '@/lib/loyalty/smartRedemptionService';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';

/**
 * Smart VivaBucks Redemption - Phase 2 Implementation
 * 
 * Features:
 * 1. Intelligent redemption suggestions based on user behavior
 * 2. Real-time earning transparency 
 * 3. Tier progression awareness
 * 4. Contextual recommendations
 */

const SmartVivaBucksRedemption = ({ 
  orderData = {}, 
  onRedemptionChange,
  className = ""
}) => {
  const { userData, isLoading } = useImprovedLoyaltyStore();
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [earningPreview, setEarningPreview] = useState(null);

  // Calculate recommendations when data changes
  useEffect(() => {
    if (userData && orderData.orderTotal > 0) {
      const recs = generateSmartRedemption(orderData, userData);
      setRecommendations(recs);
      
      const earning = calculateEarningTransparency(orderData.orderTotal, userData);
      setEarningPreview(earning);
    }
  }, [userData, orderData]);

  // Notify parent component of redemption changes
  useEffect(() => {
    if (onRedemptionChange) {
      onRedemptionChange(selectedAmount);
    }
  }, [selectedAmount, onRedemptionChange]);

  // Loading state
  if (isLoading || !userData) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3 w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // No VivaBucks available
  if (!userData.availableVivaBucks || userData.availableVivaBucks === 0) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <FaCoins className="text-blue-500 mr-2" />
          <span className="text-blue-700 font-medium">No VivaBucks available</span>
        </div>
        {earningPreview && (
          <div className="mt-2 text-sm text-blue-600">
            💡 This order will earn you {earningPreview.totalEarning} VivaBucks for future use!
          </div>
        )}
      </div>
    );
  }

  // No recommendations (order too small)
  if (!recommendations || !recommendations.recommended) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <FaCoins className="text-yellow-500 mr-2" />
          <span className="text-yellow-700 font-medium">
            VivaBucks Available: {userData.availableVivaBucks.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 text-sm text-yellow-600">
          {recommendations?.reason || 'Consider a larger order to maximize VivaBucks value'}
        </div>
        {earningPreview && (
          <div className="mt-2 text-sm text-yellow-600">
            💡 This order will earn {earningPreview.totalEarning} VivaBucks
          </div>
        )}
      </div>
    );
  }

  const { primarySuggestion, allSuggestions, contextualInfo, tierProgression } = recommendations;

  return (
    <div className={`bg-white border-2 border-green-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaLightbulb className="text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Smart VivaBucks Suggestions</h3>
        </div>
        <span className="text-sm text-gray-500">
          {userData.availableVivaBucks.toLocaleString()} available
        </span>
      </div>

      {/* Earning Preview */}
      {earningPreview && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-3 mb-4"
        >
          <div className="flex items-center mb-2">
            <FaChartLine className="text-blue-500 mr-2" />
            <span className="font-medium text-blue-700">Earning Preview</span>
          </div>
          <div className="text-sm text-blue-600">
            {earningPreview.explanation}
          </div>
          {earningPreview.tierBonus && (
            <div className="text-xs text-blue-500 mt-1">
              ⭐ {userData.currentTier} tier bonus included
            </div>
          )}
        </motion.div>
      )}

      {/* Primary Suggestion */}
      <div className="space-y-3">
        <RecommendationCard
          suggestion={primarySuggestion}
          isSelected={selectedAmount === primarySuggestion.vivaBucksToUse}
          onSelect={() => setSelectedAmount(
            selectedAmount === primarySuggestion.vivaBucksToUse ? 0 : primarySuggestion.vivaBucksToUse
          )}
          isPrimary={true}
        />

        {/* Tier Progression Alert */}
        {tierProgression && tierProgression.pointsToNext <= earningPreview?.totalEarning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-50 border border-purple-200 rounded-lg p-3"
          >
            <div className="flex items-center">
              <FaTrophy className="text-purple-500 mr-2" />
              <span className="font-medium text-purple-700">Tier Upgrade Alert!</span>
            </div>
            <div className="text-sm text-purple-600 mt-1">
              This order will upgrade you to {tierProgression.next} tier! 
              🎉 {tierProgression.multiplierIncrease > 0 && `+${tierProgression.multiplierIncrease}x earning bonus`}
            </div>
          </motion.div>
        )}

        {/* Alternative Suggestions */}
        {allSuggestions.length > 1 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center">
              <FaArrowUp className="w-3 h-3 mr-1 transform transition-transform duration-200" />
              See {allSuggestions.length - 1} more suggestion{allSuggestions.length > 2 ? 's' : ''}
            </summary>
            <div className="mt-3 space-y-2">
              {allSuggestions.slice(1).map((suggestion, index) => (
                <RecommendationCard
                  key={index}
                  suggestion={suggestion}
                  isSelected={selectedAmount === suggestion.vivaBucksToUse}
                  onSelect={() => setSelectedAmount(
                    selectedAmount === suggestion.vivaBucksToUse ? 0 : suggestion.vivaBucksToUse
                  )}
                  isPrimary={false}
                />
              ))}
            </div>
          </details>
        )}

        {/* Contextual Information */}
        {contextualInfo && contextualInfo.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">💡 Personalized Insights</div>
            {contextualInfo.map((info, index) => (
              <div key={index} className="text-xs text-gray-600 mb-1">
                • {info.message}
              </div>
            ))}
          </div>
        )}

        {/* Manual Input Option */}
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Choose custom amount
          </summary>
          <div className="mt-2">
            <CustomAmountInput
              maxAmount={Math.min(userData.availableVivaBucks, orderData.orderTotal * 10)}
              currentAmount={selectedAmount}
              onChange={setSelectedAmount}
            />
          </div>
        </details>
      </div>

      {/* Selected Amount Summary */}
      {selectedAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-700">
                Using {selectedAmount.toLocaleString()} VivaBucks
              </div>
              <div className="text-sm text-green-600">
                Savings: ${(selectedAmount * 0.01).toFixed(2)} • 
                Remaining: {(userData.availableVivaBucks - selectedAmount).toLocaleString()} VivaBucks
              </div>
            </div>
            <FaCheck className="text-green-500" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Individual recommendation card component
const RecommendationCard = ({ suggestion, isSelected, onSelect, isPrimary }) => {
  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'MAXIMUM_SAVINGS': return <FaCoins className="text-orange-500" />;
      case 'BALANCED': return <FaStar className="text-blue-500" />;
      case 'CONSERVATIVE': return <FaTrophy className="text-green-500" />;
      case 'TIER_FOCUSED': return <FaArrowUp className="text-purple-500" />;
      default: return <FaLightbulb className="text-gray-500" />;
    }
  };

  const getStrategyName = (strategy) => {
    switch (strategy) {
      case 'MAXIMUM_SAVINGS': return 'Maximum Savings';
      case 'BALANCED': return 'Balanced Approach';
      case 'CONSERVATIVE': return 'Conservative';
      case 'TIER_FOCUSED': return 'Tier Focused';
      default: return 'Recommended';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-green-500 bg-green-50' 
          : isPrimary 
            ? 'border-blue-300 bg-blue-50 hover:border-blue-400' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            {getStrategyIcon(suggestion.strategy)}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900">
                {getStrategyName(suggestion.strategy)}
              </span>
              {isPrimary && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Recommended
                </span>
              )}
              {suggestion.specialType === 'TIER_UPGRADE' && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  🎯 Tier Focus
                </span>
              )}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              {suggestion.description}
            </div>
            
            {/* Pros and Cons */}
            <div className="text-xs space-y-1">
              <div className="text-green-600">
                ✓ {suggestion.pros.join(' • ')}
              </div>
              {suggestion.cons && suggestion.cons.length > 0 && (
                <div className="text-gray-500">
                  • {suggestion.cons.join(' • ')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right ml-3">
          <div className="font-bold text-green-600">
            ${suggestion.savings.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {suggestion.vivaBucksToUse.toLocaleString()} VB
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Custom amount input component
const CustomAmountInput = ({ maxAmount, currentAmount, onChange }) => {
  const [inputValue, setInputValue] = useState(currentAmount.toString());

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only numbers
    setInputValue(value);
    
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= maxAmount) {
      onChange(numValue);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1">
          Max: {maxAmount.toLocaleString()} VivaBucks
        </div>
      </div>
      <div className="text-sm text-gray-600">
        = ${(parseInt(inputValue) * 0.01 || 0).toFixed(2)}
      </div>
    </div>
  );
};

export default SmartVivaBucksRedemption; 