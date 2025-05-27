/**
 * Smart Redemption Service - Phase 2 Implementation
 * 
 * Provides intelligent VivaBucks usage recommendations based on:
 * 1. User behavior patterns
 * 2. Order value optimization
 * 3. Tier progression goals
 * 4. Contextual recommendations
 */

import { TIER_CONFIG } from './tierConfig';

// Redemption strategies
const REDEMPTION_STRATEGIES = {
  AGGRESSIVE: 'Use maximum VivaBucks for biggest savings',
  BALANCED: 'Smart balance between savings and future rewards',
  CONSERVATIVE: 'Minimal usage to maintain earning momentum',
  MILESTONE_FOCUSED: 'Optimize for next tier achievement'
};

// User behavior analysis
const analyzeUserBehavior = (userData, orderHistory = []) => {
  if (!userData || !Array.isArray(orderHistory)) {
    return { type: 'BALANCED', confidence: 0.5 };
  }

  const recentOrders = orderHistory.slice(0, 10); // Last 10 orders
  const totalOrders = recentOrders.length;
  
  if (totalOrders === 0) {
    return { type: 'BALANCED', confidence: 0.3 };
  }

  // Calculate redemption patterns
  const redemptionFrequency = recentOrders.filter(order => 
    order.vivaBucksUsed && order.vivaBucksUsed > 0
  ).length / totalOrders;

  const averageRedemption = recentOrders.reduce((sum, order) => 
    sum + (order.vivaBucksUsed || 0), 0
  ) / totalOrders;

  const averageOrder = recentOrders.reduce((sum, order) => 
    sum + (order.total || 0), 0
  ) / totalOrders;

  // Analyze behavior pattern
  if (redemptionFrequency > 0.7 && averageRedemption > averageOrder * 0.1) {
    return { type: 'AGGRESSIVE', confidence: 0.8 };
  } else if (redemptionFrequency < 0.3) {
    return { type: 'CONSERVATIVE', confidence: 0.7 };
  } else {
    return { type: 'BALANCED', confidence: 0.6 };
  }
};

// Calculate tier progression impact
const calculateTierProgression = (userData, potentialEarning) => {
  if (!userData) return null;

  const currentPoints = userData.totalVivaBucksEarned || 0;
  const newTotal = currentPoints + potentialEarning;
  
  const currentTier = userData.currentTier || 'EXPLORER';
  const currentTierInfo = TIER_CONFIG[currentTier];
  
  // Check for tier upgrade
  const tiers = Object.entries(TIER_CONFIG).sort((a, b) => a[1].points - b[1].points);
  const nextTier = tiers.find(([name, config]) => config.points > currentPoints);
  
  if (!nextTier) {
    return { upgrade: false, current: currentTier, next: null };
  }

  const [nextTierName, nextTierConfig] = nextTier;
  const pointsToNext = nextTierConfig.points - currentPoints;
  const willUpgrade = potentialEarning >= pointsToNext;

  return {
    upgrade: willUpgrade,
    current: currentTier,
    next: nextTierName,
    pointsToNext,
    pointsAfterOrder: potentialEarning,
    multiplierIncrease: willUpgrade ? (nextTierConfig.multiplier - currentTierInfo.multiplier) : 0
  };
};

// Generate smart redemption recommendation
export const generateSmartRedemption = (orderData, userData, options = {}) => {
  const {
    orderTotal = 0,
    items = [],
    shippingCost = 0,
    orderHistory = [],
    context = 'checkout'
  } = orderData;

  if (!userData || !userData.availableVivaBucks) {
    return {
      recommended: false,
      reason: 'No VivaBucks available',
      suggestions: []
    };
  }

  const availableVivaBucks = userData.availableVivaBucks;
  const maxRedemption = Math.min(availableVivaBucks, orderTotal * 10); // Max $1 per 10 VivaBucks
  
  if (maxRedemption < 50) { // Minimum 50 VivaBucks to suggest
    return {
      recommended: false,
      reason: 'Insufficient VivaBucks for meaningful redemption',
      suggestions: []
    };
  }

  // Analyze user behavior
  const behaviorProfile = analyzeUserBehavior(userData, orderHistory);
  
  // Calculate potential earning from this order
  const multiplier = userData.pointsMultiplier || 1;
  const potentialEarning = Math.floor(orderTotal * multiplier);
  
  // Check tier progression
  const tierProgression = calculateTierProgression(userData, potentialEarning);

  // Generate recommendations based on strategy
  const suggestions = [];

  // Strategy 1: Maximum savings (Aggressive)
  if (behaviorProfile.type === 'AGGRESSIVE' || maxRedemption >= orderTotal * 5) {
    suggestions.push({
      strategy: 'MAXIMUM_SAVINGS',
      vivaBucksToUse: maxRedemption,
      savings: maxRedemption * 0.01,
      newBalance: availableVivaBucks - maxRedemption,
      description: `Use ${maxRedemption.toLocaleString()} VivaBucks for maximum savings of $${(maxRedemption * 0.01).toFixed(2)}`,
      priority: behaviorProfile.type === 'AGGRESSIVE' ? 1 : 3,
      pros: ['Maximum immediate savings', 'Lower final order cost'],
      cons: ['Fewer VivaBucks for future use']
    });
  }

  // Strategy 2: Balanced approach
  const balancedAmount = Math.floor(maxRedemption * 0.5);
  if (balancedAmount >= 50) {
    suggestions.push({
      strategy: 'BALANCED',
      vivaBucksToUse: balancedAmount,
      savings: balancedAmount * 0.01,
      newBalance: availableVivaBucks - balancedAmount,
      description: `Use ${balancedAmount.toLocaleString()} VivaBucks for $${(balancedAmount * 0.01).toFixed(2)} off while keeping reserves`,
      priority: behaviorProfile.type === 'BALANCED' ? 1 : 2,
      pros: ['Good savings now', 'Maintains VivaBucks balance'],
      cons: ['Less savings than maximum']
    });
  }

  // Strategy 3: Conservative (keep most VivaBucks)
  const conservativeAmount = Math.min(200, Math.floor(maxRedemption * 0.25));
  if (conservativeAmount >= 50) {
    suggestions.push({
      strategy: 'CONSERVATIVE',
      vivaBucksToUse: conservativeAmount,
      savings: conservativeAmount * 0.01,
      newBalance: availableVivaBucks - conservativeAmount,
      description: `Use just ${conservativeAmount.toLocaleString()} VivaBucks for $${(conservativeAmount * 0.01).toFixed(2)} off, keep the rest`,
      priority: behaviorProfile.type === 'CONSERVATIVE' ? 1 : 3,
      pros: ['Preserves VivaBucks balance', 'Still provides savings'],
      cons: ['Minimal immediate savings']
    });
  }

  // Strategy 4: Tier-focused (if close to upgrade)
  if (tierProgression && tierProgression.pointsToNext <= potentialEarning * 2) {
    suggestions.push({
      strategy: 'TIER_FOCUSED',
      vivaBucksToUse: Math.min(100, balancedAmount), // Minimal usage
      savings: Math.min(100, balancedAmount) * 0.01,
      newBalance: availableVivaBucks - Math.min(100, balancedAmount),
      description: `Use minimal VivaBucks - you're close to ${tierProgression.next} tier!`,
      priority: 1,
      pros: [
        `Only ${tierProgression.pointsToNext} points to ${tierProgression.next} tier`,
        `${tierProgression.multiplierIncrease}x bonus multiplier after upgrade`,
        'Long-term earning potential'
      ],
      cons: ['Lower immediate savings'],
      specialType: 'TIER_UPGRADE',
      tierInfo: tierProgression
    });
  }

  // Sort suggestions by priority
  suggestions.sort((a, b) => a.priority - b.priority);

  // Add contextual recommendations
  const contextualSuggestions = generateContextualSuggestions(orderData, userData, suggestions);

  return {
    recommended: suggestions.length > 0,
    primarySuggestion: suggestions[0],
    allSuggestions: suggestions,
    contextualInfo: contextualSuggestions,
    userProfile: behaviorProfile,
    tierProgression,
    metadata: {
      availableVivaBucks,
      maxRedemption,
      potentialEarning,
      orderTotal,
      timestamp: new Date().toISOString()
    }
  };
};

// Generate contextual suggestions based on order contents
const generateContextualSuggestions = (orderData, userData, baseSuggestions) => {
  const suggestions = [];
  const { items = [], orderTotal = 0 } = orderData;

  // Prescription-specific suggestions
  const hasRx = items.some(item => item.category === 'prescription' || item.isRx);
  if (hasRx) {
    suggestions.push({
      type: 'PRESCRIPTION',
      message: 'Consider saving VivaBucks for your monthly prescription refills',
      action: 'Use less now, save for regular medication costs'
    });
  }

  // High-value order suggestions
  if (orderTotal > 100) {
    suggestions.push({
      type: 'HIGH_VALUE',
      message: 'Large order detected - maximize your VivaBucks earning potential',
      action: 'Consider using fewer VivaBucks to earn more on this valuable order'
    });
  }

  // Frequent shopper insights
  if (userData.totalVivaBucksEarned > 5000) {
    suggestions.push({
      type: 'FREQUENT_SHOPPER',
      message: `You've earned ${userData.totalVivaBucksEarned.toLocaleString()} total VivaBucks!`,
      action: 'You know the system well - trust your instincts'
    });
  }

  return suggestions;
};

// Quick redemption calculator for real-time display
export const calculateQuickRedemption = (vivaBucksAmount) => {
  if (!vivaBucksAmount || vivaBucksAmount <= 0) return null;

  return {
    dollarValue: (vivaBucksAmount * 0.01).toFixed(2),
    formatted: `${vivaBucksAmount.toLocaleString()} VivaBucks = $${(vivaBucksAmount * 0.01).toFixed(2)}`
  };
};

// Earning transparency calculator
export const calculateEarningTransparency = (orderTotal, userData) => {
  if (!userData || !orderTotal) return null;

  const multiplier = userData.pointsMultiplier || 1;
  const baseEarning = Math.floor(orderTotal); // 1 point per dollar
  const bonusEarning = Math.floor(orderTotal * (multiplier - 1));
  const totalEarning = baseEarning + bonusEarning;

  return {
    baseEarning,
    bonusEarning,
    totalEarning,
    multiplier,
    tierBonus: multiplier > 1,
    explanation: `$${orderTotal} order = ${baseEarning} base VivaBucks${bonusEarning > 0 ? ` + ${bonusEarning} tier bonus` : ''} = ${totalEarning} total VivaBucks`,
    futureValue: `Worth $${(totalEarning * 0.01).toFixed(2)} in future purchases`
  };
};

export default {
  generateSmartRedemption,
  calculateQuickRedemption,
  calculateEarningTransparency
}; 