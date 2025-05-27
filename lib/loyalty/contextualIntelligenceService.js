/**
 * Contextual Intelligence Service - Phase 3 Implementation
 * 
 * Provides predictive analytics and contextual insights:
 * 1. Predictive earning forecasts
 * 2. Usage pattern analysis  
 * 3. Prescription-specific intelligence
 * 4. Order context awareness
 * 5. Tier progression predictions
 */

import { TIER_CONFIG } from './tierConfig';

// Order context types
const ORDER_CONTEXTS = {
  PRESCRIPTION: 'prescription',
  WELLNESS: 'wellness', 
  EMERGENCY: 'emergency',
  BULK: 'bulk',
  SEASONAL: 'seasonal'
};

// User behavior patterns
const BEHAVIOR_PATTERNS = {
  FREQUENT_SMALL: 'frequent_small_orders',
  BULK_BUYER: 'bulk_buyer', 
  PRESCRIPTION_FOCUSED: 'prescription_focused',
  SEASONAL_SHOPPER: 'seasonal_shopper',
  BARGAIN_HUNTER: 'bargain_hunter'
};

/**
 * Analyze user's historical order patterns
 */
export const analyzeOrderPatterns = (orderHistory = [], userData = {}) => {
  if (!orderHistory.length) {
    return {
      pattern: BEHAVIOR_PATTERNS.FREQUENT_SMALL,
      confidence: 0.2,
      insights: ["Not enough order history for pattern analysis"],
      metrics: {
        averageOrderValue: 50, // Default reasonable value
        averageTimeBetweenOrders: 30, // Default 30 days
        prescriptionOrderRate: 0,
        redemptionRate: 0,
        totalOrders: 0
      }
    };
  }

  const recentOrders = orderHistory.slice(0, 20); // Last 20 orders
  const totalOrders = recentOrders.length;
  
  // Calculate metrics
  const averageOrderValue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0) / totalOrders;
  const averageTimeBetweenOrders = calculateAverageOrderFrequency(recentOrders);
  const prescriptionOrderCount = recentOrders.filter(order => 
    order.items?.some(item => item.category === 'prescription' || item.isPrescription)
  ).length;
  
  const seasonalVariation = analyzeSaisonalPatterns(recentOrders);
  const redemptionRate = recentOrders.filter(order => order.vivaBucksUsed > 0).length / totalOrders;

  // Determine primary pattern
  let pattern, confidence = 0.7;
  const insights = [];

  if (prescriptionOrderCount / totalOrders > 0.6) {
    pattern = BEHAVIOR_PATTERNS.PRESCRIPTION_FOCUSED;
    insights.push(`${Math.round(prescriptionOrderCount / totalOrders * 100)}% of orders include prescriptions`);
  } else if (averageOrderValue > 100 && averageTimeBetweenOrders > 30) {
    pattern = BEHAVIOR_PATTERNS.BULK_BUYER;
    insights.push(`Large orders ($${averageOrderValue.toFixed(0)}) every ${Math.round(averageTimeBetweenOrders)} days`);
  } else if (averageTimeBetweenOrders < 14 && averageOrderValue < 50) {
    pattern = BEHAVIOR_PATTERNS.FREQUENT_SMALL;
    insights.push(`Frequent small orders ($${averageOrderValue.toFixed(0)}) every ${Math.round(averageTimeBetweenOrders)} days`);
  } else if (seasonalVariation.isHighlyVariable) {
    pattern = BEHAVIOR_PATTERNS.SEASONAL_SHOPPER;
    insights.push(`Order activity varies by season (${seasonalVariation.description})`);
  } else if (redemptionRate > 0.7) {
    pattern = BEHAVIOR_PATTERNS.BARGAIN_HUNTER;
    insights.push(`Uses VivaBucks frequently (${Math.round(redemptionRate * 100)}% of orders)`);
  } else {
    pattern = BEHAVIOR_PATTERNS.FREQUENT_SMALL;
    confidence = 0.5;
  }

  // Add additional insights
  insights.push(`Average order: $${averageOrderValue.toFixed(2)}`);
  insights.push(`Order frequency: Every ${Math.round(averageTimeBetweenOrders)} days`);
  
  if (redemptionRate > 0) {
    insights.push(`Redeems VivaBucks on ${Math.round(redemptionRate * 100)}% of orders`);
  }

  return {
    pattern,
    confidence,
    insights,
    metrics: {
      averageOrderValue,
      averageTimeBetweenOrders,
      prescriptionOrderRate: prescriptionOrderCount / totalOrders,
      redemptionRate,
      totalOrders
    }
  };
};

/**
 * Generate predictive earning forecasts
 */
export const generateEarningForecasts = (userData = {}, orderHistory = [], currentOrder = null) => {
  const patterns = analyzeOrderPatterns(orderHistory, userData);
  const currentTier = userData.currentTier || 'EXPLORER';
  const multiplier = userData.pointsMultiplier || 1;
  
  const forecasts = [];

  // Next tier progression forecast
  const tierProgression = calculateTierProgression(userData);
  if (tierProgression.nextTier) {
    const ordersToNext = Math.ceil(tierProgression.pointsNeeded / (patterns.metrics.averageOrderValue * multiplier));
    const timeToNext = ordersToNext * patterns.metrics.averageTimeBetweenOrders;
    
    forecasts.push({
      type: 'tier_progression',
      title: 'Next Tier Unlock',
      description: `${ordersToNext} more orders like yours will unlock ${tierProgression.nextTier} tier`,
      timeframe: `Estimated ${Math.round(timeToNext)} days at current pace`,
      confidence: patterns.confidence,
      actionable: true,
      details: {
        ordersNeeded: ordersToNext,
        pointsNeeded: tierProgression.pointsNeeded,
        newMultiplier: tierProgression.nextMultiplier,
        benefitDescription: `${tierProgression.nextMultiplier}x earning bonus + tier benefits`
      }
    });
  }

  // Monthly earning projection
  const monthlyOrders = Math.round(30 / patterns.metrics.averageTimeBetweenOrders);
  const monthlyEarning = monthlyOrders * patterns.metrics.averageOrderValue * multiplier;
  
  forecasts.push({
    type: 'monthly_projection',
    title: 'Monthly Earning Forecast',
    description: `You typically earn ~${Math.round(monthlyEarning)} VivaBucks per month`,
    timeframe: 'Based on your order history',
    confidence: patterns.confidence,
    actionable: false,
    details: {
      estimatedOrders: monthlyOrders,
      estimatedEarning: Math.round(monthlyEarning),
      dollarValue: (monthlyEarning * 0.01).toFixed(2)
    }
  });

  // Prescription-specific forecasts
  if (patterns.pattern === BEHAVIOR_PATTERNS.PRESCRIPTION_FOCUSED) {
    const prescriptionValue = calculatePrescriptionValue(orderHistory);
    forecasts.push({
      type: 'prescription_savings',
      title: 'Prescription Savings Goal',
      description: `Save enough VivaBucks to cover your next refill`,
      timeframe: `Need ${Math.round(prescriptionValue * 100 - (userData.availableVivaBucks || 0))} more VivaBucks`,
      confidence: 0.8,
      actionable: true,
      details: {
        averagePrescriptionCost: prescriptionValue,
        currentBalance: userData.availableVivaBucks || 0,
        neededAmount: Math.max(0, prescriptionValue * 100 - (userData.availableVivaBucks || 0))
      }
    });
  }

  // Current order impact forecast
  if (currentOrder && currentOrder.total > 0) {
    const orderEarning = Math.floor(currentOrder.total * multiplier);
    const newBalance = (userData.availableVivaBucks || 0) + orderEarning;
    
    forecasts.push({
      type: 'current_order_impact',
      title: 'This Order Impact',
      description: `This $${currentOrder.total} order will earn ${orderEarning} VivaBucks`,
      timeframe: 'Available immediately after purchase',
      confidence: 1.0,
      actionable: true,
      details: {
        orderTotal: currentOrder.total,
        vivaBucksEarned: orderEarning,
        newBalance,
        dollarValue: (newBalance * 0.01).toFixed(2)
      }
    });
  }

  return forecasts.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Generate contextual insights based on order type and user behavior
 */
export const generateContextualInsights = (orderData = {}, userData = {}, orderHistory = []) => {
  const insights = [];
  const orderContext = determineOrderContext(orderData);
  const patterns = analyzeOrderPatterns(orderHistory, userData);

  // Context-specific insights
  switch (orderContext) {
    case ORDER_CONTEXTS.PRESCRIPTION:
      insights.push({
        type: 'prescription_bonus',
        message: "Prescription orders earn bonus loyalty points this month!",
        priority: 'high',
        actionable: true
      });
      
      if (patterns.pattern === BEHAVIOR_PATTERNS.PRESCRIPTION_FOCUSED) {
        insights.push({
          type: 'auto_refill_suggestion',
          message: "Most prescription customers save 15% more with auto-refill",
          priority: 'medium',
          actionable: true
        });
      }
      break;

    case ORDER_CONTEXTS.BULK:
      insights.push({
        type: 'bulk_savings',
        message: `Large orders like this typically earn ${Math.round(orderData.total * 1.5)} VivaBucks`,
        priority: 'high',
        actionable: false
      });
      break;

    case ORDER_CONTEXTS.SEASONAL:
      insights.push({
        type: 'seasonal_promotion',
        message: "Cold & flu season: Stock up and earn bonus points!",
        priority: 'medium',
        actionable: true
      });
      break;
  }

  // Personalized usage insights
  if (patterns.metrics.redemptionRate < 0.3) {
    insights.push({
      type: 'redemption_encouragement',
      message: `Your ${userData.availableVivaBucks || 0} VivaBucks are worth $${((userData.availableVivaBucks || 0) * 0.01).toFixed(2)}!`,
      priority: 'medium',
      actionable: true
    });
  }

  // Tier-specific insights
  const tierProgression = calculateTierProgression(userData);
  if (tierProgression.progressPercent > 80) {
    insights.push({
      type: 'tier_upgrade_close',
      message: `You're ${tierProgression.progressPercent}% of the way to ${tierProgression.nextTier} tier!`,
      priority: 'high',
      actionable: true
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Generate usage recommendations based on patterns
 */
export const generateUsageRecommendations = (userData = {}, orderHistory = []) => {
  const patterns = analyzeOrderPatterns(orderHistory, userData);
  const recommendations = [];

  // Pattern-based recommendations
  switch (patterns.pattern) {
    case BEHAVIOR_PATTERNS.FREQUENT_SMALL:
      recommendations.push({
        title: "Optimize Your Small Orders",
        description: "You typically save VivaBucks for orders over $75",
        suggestion: "Consider bundling items to maximize earning and unlock free shipping",
        confidence: patterns.confidence
      });
      break;

    case BEHAVIOR_PATTERNS.BULK_BUYER:
      recommendations.push({
        title: "Bulk Order Strategy",
        description: "Your large orders are perfect for maximizing VivaBucks",
        suggestion: "Time your bulk orders with tier upgrade periods for bonus points",
        confidence: patterns.confidence
      });
      break;

    case BEHAVIOR_PATTERNS.PRESCRIPTION_FOCUSED:
      recommendations.push({
        title: "Prescription Optimization",
        description: "Prescription customers typically save 20% more with strategic planning",
        suggestion: "Bundle OTC items with prescription orders for bonus earning",
        confidence: patterns.confidence
      });
      break;

    case BEHAVIOR_PATTERNS.BARGAIN_HUNTER:
      recommendations.push({
        title: "Smart Redemption Timing",
        description: `You redeem VivaBucks ${Math.round(patterns.metrics.redemptionRate * 100)}% of the time`,
        suggestion: "Your redemption sweet spot: 800-1200 VivaBucks at once",
        confidence: patterns.confidence
      });
      break;
  }

  return recommendations;
};

// Helper functions
const calculateAverageOrderFrequency = (orders) => {
  if (orders.length < 2) return 30; // Default to 30 days
  
  const dates = orders.map(order => new Date(order.createdAt)).sort((a, b) => b - a);
  const intervals = [];
  
  for (let i = 0; i < dates.length - 1; i++) {
    const daysDiff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }
  
  return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
};

const analyzeSaisonalPatterns = (orders) => {
  const monthlyDistribution = {};
  
  orders.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    monthlyDistribution[month] = (monthlyDistribution[month] || 0) + 1;
  });
  
  const values = Object.values(monthlyDistribution);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return {
    isHighlyVariable: variance > mean,
    description: variance > mean ? "High seasonal variation" : "Consistent year-round"
  };
};

const determineOrderContext = (orderData) => {
  if (!orderData.items) return ORDER_CONTEXTS.WELLNESS;
  
  const hasRx = orderData.items.some(item => item.category === 'prescription' || item.isPrescription);
  if (hasRx) return ORDER_CONTEXTS.PRESCRIPTION;
  
  const totalItems = orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (totalItems > 10 || orderData.total > 150) return ORDER_CONTEXTS.BULK;
  
  const seasonalCategories = ['cold-flu', 'allergy', 'suncare', 'vitamins'];
  const hasSeasonalItems = orderData.items.some(item => 
    seasonalCategories.some(cat => item.category?.includes(cat))
  );
  if (hasSeasonalItems) return ORDER_CONTEXTS.SEASONAL;
  
  return ORDER_CONTEXTS.WELLNESS;
};

const calculateTierProgression = (userData) => {
  const currentPoints = userData.totalVivaBucksEarned || 0;
  const currentTier = userData.currentTier || 'EXPLORER';
  
  const tiers = Object.entries(TIER_CONFIG).sort((a, b) => a[1].points - b[1].points);
  const currentTierIndex = tiers.findIndex(([name]) => name === currentTier);
  
  if (currentTierIndex === -1 || currentTierIndex === tiers.length - 1) {
    return { nextTier: null, pointsNeeded: 0, progressPercent: 100 };
  }
  
  const [nextTierName, nextTierConfig] = tiers[currentTierIndex + 1];
  const pointsNeeded = nextTierConfig.points - currentPoints;
  const currentTierPoints = TIER_CONFIG[currentTier].points;
  const progressPercent = Math.round(
    ((currentPoints - currentTierPoints) / (nextTierConfig.points - currentTierPoints)) * 100
  );
  
  return {
    nextTier: nextTierName,
    nextMultiplier: nextTierConfig.multiplier,
    pointsNeeded: Math.max(0, pointsNeeded),
    progressPercent: Math.max(0, Math.min(100, progressPercent))
  };
};

const calculatePrescriptionValue = (orderHistory) => {
  const prescriptionOrders = orderHistory.filter(order =>
    order.items?.some(item => item.category === 'prescription' || item.isPrescription)
  );
  
  if (!prescriptionOrders.length) return 30; // Default prescription value
  
  const averageRxValue = prescriptionOrders.reduce((sum, order) => {
    const rxItems = order.items.filter(item => item.category === 'prescription' || item.isPrescription);
    const rxTotal = rxItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    return sum + rxTotal;
  }, 0) / prescriptionOrders.length;
  
  return averageRxValue;
};

export default {
  analyzeOrderPatterns,
  generateEarningForecasts,
  generateContextualInsights,
  generateUsageRecommendations,
  ORDER_CONTEXTS,
  BEHAVIOR_PATTERNS
}; 