'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLightbulb, 
  FaCoins, 
  FaTimes, 
  FaCheckCircle,
  FaArrowRight,
  FaMagic as FaSparkles,
  FaGift,
  FaTrophy,
  FaChartLine
} from 'react-icons/fa';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';
import { 
  generateAutomaticChoice,
  predictUserNeeds 
} from '@/lib/loyalty/zeroCognitiveLoadService';

/**
 * Smart Suggestion Toast - Phase 3 Implementation
 * 
 * Provides non-intrusive, intelligent recommendations through:
 * 1. Contextual timing based on user behavior
 * 2. Smart auto-dismissal to avoid notification fatigue
 * 3. Action-oriented suggestions with one-click acceptance
 * 4. Predictive intelligence for proactive assistance
 * 5. Personalized messaging based on user patterns
 * 
 * Features:
 * - Zero cognitive load design
 * - Natural language suggestions
 * - Contextual icons and colors
 * - Mobile-optimized positioning
 * - Smart batching to prevent spam
 */

const SmartSuggestionToast = ({
  suggestion = null,
  autoShow = true,
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center'
  duration = 8000, // 8 seconds default
  onAccept,
  onDismiss,
  onAction,
  className = ''
}) => {
  const { userData } = useImprovedLoyaltyStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, entering, visible, exiting

  useEffect(() => {
    if (suggestion && autoShow) {
      showSuggestion(suggestion);
    }
  }, [suggestion, autoShow]);

  const showSuggestion = (suggestionData) => {
    if (isVisible || !suggestionData) return;

    setCurrentSuggestion(enrichSuggestion(suggestionData));
    setAnimationPhase('entering');
    setIsVisible(true);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss('auto');
    }, duration);

    return () => clearTimeout(timer);
  };

  const handleAccept = async () => {
    if (!currentSuggestion || isActing) return;

    setIsActing(true);
    
    try {
      if (onAccept) {
        await onAccept(currentSuggestion);
      }
      
      if (currentSuggestion.action && onAction) {
        await onAction(currentSuggestion.action, currentSuggestion);
      }

      // Show success micro-interaction
      setAnimationPhase('success');
      setTimeout(() => {
        handleDismiss('accepted');
      }, 1500);
      
    } catch (error) {
      console.error('[SmartToast] Action failed:', error);
      setIsActing(false);
    }
  };

  const handleDismiss = (reason = 'manual') => {
    setAnimationPhase('exiting');
    
    setTimeout(() => {
      setIsVisible(false);
      setCurrentSuggestion(null);
      setAnimationPhase('idle');
      setIsActing(false);
      
      if (onDismiss) {
        onDismiss(reason, currentSuggestion);
      }
    }, 300);
  };

  if (!isVisible || !currentSuggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={getInitialAnimation(position)}
        animate={getVisibleAnimation(animationPhase)}
        exit={getExitAnimation(position)}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          duration: 0.4 
        }}
        className={`
          ${getPositionClasses(position)}
          ${className}
          fixed max-w-sm w-full mx-4
        `}
        style={{ zIndex: 'var(--z-notification)' }}
      >
        <div className={`
          bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden
          ${currentSuggestion.priority === 'high' ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}
        `}>
          {/* Progress Bar */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className="h-1 bg-gradient-to-r from-purple-400 to-blue-400"
          />

          {/* Main Content */}
          <div className="p-4">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${currentSuggestion.iconBg}
              `}>
                {currentSuggestion.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {currentSuggestion.title}
                  </h4>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={() => handleDismiss('manual')}
                    disabled={isActing}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {currentSuggestion.message}
                </p>

                {/* Value/Benefit Display */}
                {currentSuggestion.benefit && (
                  <div className="mb-3 p-2 bg-green-50 rounded-md border border-green-100">
                    <div className="flex items-center space-x-1">
                      <FaCoins className="text-green-500 text-sm" />
                      <span className="text-sm font-medium text-green-700">
                        {currentSuggestion.benefit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {currentSuggestion.actionable && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAccept}
                      disabled={isActing}
                      className={`
                        flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        ${animationPhase === 'success' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }
                      `}
                    >
                      {isActing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 border border-white border-t-transparent rounded-full"
                        />
                      ) : animationPhase === 'success' ? (
                        <FaCheckCircle className="w-3 h-3" />
                      ) : (
                        <FaArrowRight className="w-3 h-3" />
                      )}
                      <span>
                        {animationPhase === 'success' 
                          ? 'Applied!' 
                          : currentSuggestion.actionText || 'Apply'
                        }
                      </span>
                    </motion.button>
                  )}

                  {currentSuggestion.learnMoreAction && (
                    <button
                      onClick={() => onAction?.(currentSuggestion.learnMoreAction, currentSuggestion)}
                      className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      Learn more
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accent Border */}
          <div className={`h-1 ${currentSuggestion.accentColor}`} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper Functions

const enrichSuggestion = (suggestion) => {
  const baseData = {
    priority: 'medium',
    actionable: true,
    icon: <FaLightbulb className="text-white text-lg" />,
    iconBg: 'bg-gradient-to-br from-purple-400 to-blue-400',
    accentColor: 'bg-gradient-to-r from-purple-400 to-blue-400',
    actionText: 'Apply',
    ...suggestion
  };

  // Enhance based on suggestion type
  switch (suggestion.type) {
    case 'vivabucks_redemption':
      return {
        ...baseData,
        icon: <FaCoins className="text-white text-lg" />,
        iconBg: 'bg-gradient-to-br from-green-400 to-emerald-400',
        accentColor: 'bg-gradient-to-r from-green-400 to-emerald-400',
        actionText: 'Use VivaBucks'
      };

    case 'tier_progression':
      return {
        ...baseData,
        icon: <FaTrophy className="text-white text-lg" />,
        iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-400',
        accentColor: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        priority: 'high'
      };

    case 'surprise_bonus':
      return {
        ...baseData,
        icon: <FaGift className="text-white text-lg" />,
        iconBg: 'bg-gradient-to-br from-pink-400 to-purple-400',
        accentColor: 'bg-gradient-to-r from-pink-400 to-purple-400',
        actionText: 'Claim Bonus',
        priority: 'high'
      };

    case 'earning_optimization':
      return {
        ...baseData,
        icon: <FaChartLine className="text-white text-lg" />,
        iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-400',
        accentColor: 'bg-gradient-to-r from-blue-400 to-cyan-400'
      };

    case 'celebration':
      return {
        ...baseData,
        icon: <FaSparkles className="text-white text-lg" />,
        iconBg: 'bg-gradient-to-br from-pink-400 to-purple-400',
        accentColor: 'bg-gradient-to-r from-pink-400 to-purple-400',
        actionable: false,
        priority: 'high'
      };

    default:
      return baseData;
  }
};

const getPositionClasses = (position) => {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

const getInitialAnimation = (position) => {
  if (position.includes('top')) {
    return { opacity: 0, y: -50, scale: 0.9 };
  } else if (position.includes('bottom')) {
    return { opacity: 0, y: 50, scale: 0.9 };
  } else if (position.includes('left')) {
    return { opacity: 0, x: -50, scale: 0.9 };
  } else {
    return { opacity: 0, x: 50, scale: 0.9 };
  }
};

const getVisibleAnimation = (phase) => {
  const base = { opacity: 1, x: 0, y: 0, scale: 1 };
  
  switch (phase) {
    case 'success':
      return { 
        ...base,
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      };
    default:
      return base;
  }
};

const getExitAnimation = (position) => {
  if (position.includes('top')) {
    return { opacity: 0, y: -30, scale: 0.9 };
  } else if (position.includes('bottom')) {
    return { opacity: 0, y: 30, scale: 0.9 };
  } else if (position.includes('left')) {
    return { opacity: 0, x: -30, scale: 0.9 };
  } else {
    return { opacity: 0, x: 30, scale: 0.9 };
  }
};

// Smart Suggestion Generator Hook
export const useSmartSuggestions = (context = {}, options = {}) => {
  const { userData } = useImprovedLoyaltyStore();
  const [activeSuggestions, setActiveSuggestions] = useState([]);
  const [suggestionHistory, setSuggestionHistory] = useState([]);

  const generateSuggestion = async (orderData, behaviorContext) => {
    if (!userData) return null;

    try {
      const predictions = predictUserNeeds(userData, orderData || {}, behaviorContext || []);
      const automaticChoice = generateAutomaticChoice(orderData || {}, userData, behaviorContext || []);

      // Convert predictions to toast suggestions
      const suggestions = predictions
        .filter(p => p.confidence > 0.6) // Only show high-confidence suggestions
        .map(prediction => ({
          id: `suggestion_${Date.now()}_${Math.random()}`,
          type: prediction.type,
          title: getReadableTitle(prediction.type),
          message: prediction.message,
          benefit: calculateBenefit(prediction, userData),
          action: prediction.action,
          confidence: prediction.confidence,
          timestamp: Date.now()
        }));

      // Add automatic choice suggestion if highly confident
      if (automaticChoice && automaticChoice.confidence > 0.8) {
        suggestions.unshift({
          id: `auto_choice_${Date.now()}`,
          type: 'vivabucks_redemption',
          title: 'Smart VivaBucks Suggestion',
          message: automaticChoice.naturalLanguage,
          benefit: `Save $${(automaticChoice.vivaBucksToUse * 0.01).toFixed(2)}`,
          action: {
            type: 'apply_vivabucks',
            amount: automaticChoice.vivaBucksToUse
          },
          confidence: automaticChoice.confidence,
          timestamp: Date.now()
        });
      }

      return suggestions;
    } catch (error) {
      console.error('[SmartSuggestions] Generation failed:', error);
      return [];
    }
  };

  const showSuggestion = (suggestionData) => {
    // Prevent spam - limit to 1 suggestion per 30 seconds
    const recentSuggestions = suggestionHistory.filter(
      s => Date.now() - s.timestamp < 30000
    );
    
    if (recentSuggestions.length >= 1) {
      console.log('[SmartSuggestions] Rate limited - skipping suggestion');
      return false;
    }

    setActiveSuggestions(prev => [...prev, suggestionData]);
    setSuggestionHistory(prev => [...prev, suggestionData].slice(-10)); // Keep last 10
    return true;
  };

  const dismissSuggestion = (suggestionId, reason) => {
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    // Learn from dismissal patterns
    if (reason === 'manual') {
      console.log('[SmartSuggestions] User manually dismissed suggestion');
    }
  };

  return {
    activeSuggestions,
    generateSuggestion,
    showSuggestion,
    dismissSuggestion
  };
};

// Helper functions for smart suggestions
const getReadableTitle = (type) => {
  const titles = {
    'redemption_preference': 'VivaBucks Suggestion',
    'tier_focus': 'Tier Progress',
    'prescription_reminder': 'Prescription Reminder',
    'surprise_bonus': 'Surprise Bonus!',
    'earning_optimization': 'Earning Tip'
  };
  
  return titles[type] || 'Smart Suggestion';
};

const calculateBenefit = (prediction, userData) => {
  switch (prediction.type) {
    case 'redemption_preference':
      const availableValue = (userData.availableVivaBucks || 0) * 0.01;
      return `$${availableValue.toFixed(2)} available to use`;
    
    case 'tier_focus':
      return `${userData.pointsMultiplier || 1}x earning multiplier`;
    
    default:
      return null;
  }
};

export default SmartSuggestionToast; 