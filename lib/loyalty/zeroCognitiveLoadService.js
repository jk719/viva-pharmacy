/**
 * Zero Cognitive Load Service - Phase 3 Implementation
 * 
 * Eliminates decision fatigue through:
 * 1. Automatic best-choice suggestions
 * 2. Natural language explanations
 * 3. Predictive user needs
 * 4. Contextual automation
 * 5. Smart defaults based on behavior
 */

import { analyzeOrderPatterns } from './contextualIntelligenceService';

// Decision automation confidence levels
const CONFIDENCE_LEVELS = {
  AUTOMATIC: 0.9,    // Auto-apply without asking
  SUGGESTED: 0.7,    // Show as recommended default
  PRESENTED: 0.5,    // Show as one option
  HIDDEN: 0.3        // Don't show to avoid confusion
};

// Natural language templates
const LANGUAGE_TEMPLATES = {
  EARNING: {
    SIMPLE: "You'll earn {amount} VivaBucks",
    DETAILED: "This ${orderTotal} order earns {baseAmount} base VivaBucks + {bonusAmount} tier bonus = {totalAmount} total",
    CONVERSATIONAL: "With this order, you'll add {amount} VivaBucks to your collection"
  },
  SAVINGS: {
    SIMPLE: "Save ${amount} with your VivaBucks",
    DETAILED: "Use {vivaBucks} VivaBucks to save ${amount} on this order",
    CONVERSATIONAL: "Your VivaBucks can knock ${amount} off this purchase"
  },
  BALANCE: {
    SIMPLE: "{amount} VivaBucks available",
    DETAILED: "You have {amount} VivaBucks (worth ${dollarValue}) ready to use",
    CONVERSATIONAL: "Your VivaBucks wallet: {amount} points = ${dollarValue} spending power"
  }
};

/**
 * Generate automatic best-choice recommendation
 */
export const generateAutomaticChoice = (orderData = {}, userData = {}, orderHistory = []) => {
  const patterns = analyzeOrderPatterns(orderHistory, userData);
  const availableVivaBucks = userData.availableVivaBucks || 0;
  const orderTotal = orderData.total || 0;
  
  if (availableVivaBucks < 50 || orderTotal === 0) {
    return {
      choice: 'USE_NONE',
      confidence: CONFIDENCE_LEVELS.AUTOMATIC,
      reasoning: "Save VivaBucks for larger future purchases",
      vivaBucksToUse: 0,
      naturalLanguage: "Keep building your VivaBucks for even better savings later!"
    };
  }

  // Analyze user's typical behavior to predict preference
  const behaviorAnalysis = analyzeBehaviorPreference(patterns, userData, orderHistory);
  
  // Calculate optimal amount based on behavior
  const optimalAmount = calculateOptimalAmount(
    orderData, 
    userData, 
    behaviorAnalysis.preferredStrategy
  );

  // Determine confidence level
  const confidence = calculateChoiceConfidence(behaviorAnalysis, patterns, orderHistory);

  return {
    choice: optimalAmount > 0 ? 'USE_OPTIMAL' : 'USE_NONE',
    confidence,
    reasoning: generateReasoning(behaviorAnalysis, optimalAmount, orderData),
    vivaBucksToUse: optimalAmount,
    naturalLanguage: generateNaturalLanguageChoice(optimalAmount, orderData, behaviorAnalysis),
    alternatives: generateAlternativeChoices(orderData, userData, behaviorAnalysis),
    userPattern: behaviorAnalysis.preferredStrategy
  };
};

/**
 * Convert technical information to natural language
 */
export const convertToNaturalLanguage = (data, context = 'general', complexity = 'simple') => {
  const template = LANGUAGE_TEMPLATES[context.toUpperCase()]?.[complexity.toUpperCase()];
  
  if (!template) {
    return data.toString();
  }

  // Replace placeholders with actual values
  return template.replace(/{(\w+)}/g, (match, key) => {
    if (data[key] !== undefined) {
      return typeof data[key] === 'number' && key.includes('amount') ? 
        data[key].toLocaleString() : data[key];
    }
    return match;
  });
};

/**
 * Predict user needs before they express them
 */
export const predictUserNeeds = (userData = {}, orderData = {}, orderHistory = [], context = {}) => {
  const predictions = [];
  const patterns = analyzeOrderPatterns(orderHistory, userData);

  // Predict redemption preferences
  if (patterns.metrics.redemptionRate > 0.5) {
    predictions.push({
      type: 'redemption_preference',
      prediction: 'User likely wants to use VivaBucks',
      confidence: patterns.confidence,
      action: 'pre_select_redemption',
      message: "Based on your history, I've suggested using VivaBucks on this order"
    });
  }

  // Predict tier upgrade interest
  const tierProgress = calculateTierProgress(userData);
  if (tierProgress.progressPercent > 75) {
    predictions.push({
      type: 'tier_focus',
      prediction: 'User interested in tier progression',
      confidence: 0.8,
      action: 'highlight_tier_progress',
      message: `You're ${tierProgress.progressPercent}% to your next tier! This order gets you closer.`
    });
  }

  // Predict prescription timing (if patterns suggest)
  if (patterns.pattern === 'prescription_focused') {
    const daysSinceLastRx = calculateDaysSinceLastPrescription(orderHistory);
    if (daysSinceLastRx > 25 && daysSinceLastRx < 35) {
      predictions.push({
        type: 'prescription_reminder',
        prediction: 'User may need prescription refill soon',
        confidence: 0.7,
        action: 'suggest_prescription_bundling',
        message: "Refill time approaching? Bundle with this order to maximize VivaBucks!"
      });
    }
  }

  // Predict bulk order timing
  if (patterns.pattern === 'bulk_buyer') {
    const lastBulkOrder = findLastBulkOrder(orderHistory);
    const daysSinceLastBulk = lastBulkOrder ? 
      Math.floor((Date.now() - new Date(lastBulkOrder.createdAt)) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceLastBulk > 45) {
      predictions.push({
        type: 'bulk_timing',
        prediction: 'User due for bulk order',
        confidence: 0.6,
        action: 'suggest_bulk_items',
        message: "Perfect timing for a bulk order! Want to add some essentials?"
      });
    }
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Generate contextual automation suggestions
 */
export const generateContextualAutomation = (orderData = {}, userData = {}, orderHistory = []) => {
  const automations = [];
  const patterns = analyzeOrderPatterns(orderHistory, userData);

  // Auto-apply free shipping if close
  const shippingThreshold = 75;
  if (orderData.total > shippingThreshold - 10 && orderData.total < shippingThreshold) {
    automations.push({
      type: 'shipping_optimization',
      action: 'suggest_free_shipping_addon',
      confidence: CONFIDENCE_LEVELS.SUGGESTED,
      message: `Add $${(shippingThreshold - orderData.total).toFixed(2)} more for free shipping!`,
      automated: false, // Suggestion, not automatic
      savings: 9.99 // Typical shipping cost
    });
  }

  // Auto-select preferred shipping based on history
  const preferredShipping = determinePreferredShipping(orderHistory);
  if (preferredShipping.confidence > CONFIDENCE_LEVELS.SUGGESTED) {
    automations.push({
      type: 'shipping_preference',
      action: 'auto_select_shipping',
      confidence: preferredShipping.confidence,
      message: `I've selected ${preferredShipping.method} shipping (your usual preference)`,
      automated: true,
      shippingMethod: preferredShipping.method
    });
  }

  // Auto-suggest payment method
  const preferredPayment = determinePreferredPayment(orderHistory);
  if (preferredPayment.confidence > CONFIDENCE_LEVELS.SUGGESTED) {
    automations.push({
      type: 'payment_preference',
      action: 'auto_select_payment',
      confidence: preferredPayment.confidence,
      message: `Using your preferred payment method`,
      automated: true,
      paymentMethod: preferredPayment.method
    });
  }

  // Auto-apply VivaBucks based on strong behavioral patterns
  const autoRedemption = generateAutomaticChoice(orderData, userData, orderHistory);
  if (autoRedemption.confidence >= CONFIDENCE_LEVELS.AUTOMATIC) {
    automations.push({
      type: 'vivabucks_redemption',
      action: 'auto_apply_vivabucks',
      confidence: autoRedemption.confidence,
      message: autoRedemption.naturalLanguage,
      automated: true,
      vivaBucksAmount: autoRedemption.vivaBucksToUse
    });
  }

  return automations.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Create smart defaults for all user interactions
 */
export const generateSmartDefaults = (userData = {}, orderHistory = [], context = 'checkout') => {
  const patterns = analyzeOrderPatterns(orderHistory, userData);
  const defaults = {};

  switch (context) {
    case 'checkout':
      defaults.shipping = determinePreferredShipping(orderHistory);
      defaults.payment = determinePreferredPayment(orderHistory);
      defaults.vivaBucksUsage = generateAutomaticChoice({}, userData, orderHistory);
      defaults.newsletter = userData.emailPreferences?.marketing !== false;
      break;

    case 'product_browsing':
      defaults.category = determineFavoriteCategory(orderHistory);
      defaults.priceRange = determinePreferredPriceRange(orderHistory);
      defaults.sortOrder = determinePreferredSort(orderHistory);
      break;

    case 'prescription':
      defaults.autoRefill = patterns.pattern === 'prescription_focused';
      defaults.reminderDays = 7; // Based on typical user preference
      break;
  }

  return defaults;
};

// Helper Functions

const analyzeBehaviorPreference = (patterns, userData, orderHistory) => {
  const redemptionHistory = orderHistory
    .filter(order => order.vivaBucksUsed > 0)
    .slice(0, 10); // Last 10 redemptions

  if (redemptionHistory.length === 0) {
    return {
      preferredStrategy: 'CONSERVATIVE',
      confidence: 0.3,
      reasoning: "No redemption history, defaulting to conservative approach"
    };
  }

  // Analyze redemption amounts relative to available balance
  const redemptionRatios = redemptionHistory.map(order => {
    const estimatedBalance = order.vivaBucksUsed + (userData.availableVivaBucks || 0);
    return order.vivaBucksUsed / estimatedBalance;
  });

  const averageRatio = redemptionRatios.reduce((sum, ratio) => sum + ratio, 0) / redemptionRatios.length;

  if (averageRatio > 0.7) {
    return {
      preferredStrategy: 'AGGRESSIVE',
      confidence: 0.8,
      reasoning: "User typically uses most available VivaBucks"
    };
  } else if (averageRatio < 0.3) {
    return {
      preferredStrategy: 'CONSERVATIVE',
      confidence: 0.7,
      reasoning: "User prefers to save most VivaBucks"
    };
  } else {
    return {
      preferredStrategy: 'BALANCED',
      confidence: 0.6,
      reasoning: "User shows balanced redemption behavior"
    };
  }
};

const calculateOptimalAmount = (orderData, userData, strategy) => {
  const availableVivaBucks = userData.availableVivaBucks || 0;
  const maxRedemption = Math.min(availableVivaBucks, orderData.total * 10);

  switch (strategy) {
    case 'AGGRESSIVE':
      return Math.floor(maxRedemption * 0.8); // Use 80% of maximum
    case 'CONSERVATIVE':
      return Math.floor(maxRedemption * 0.2); // Use 20% of maximum
    case 'BALANCED':
    default:
      return Math.floor(maxRedemption * 0.5); // Use 50% of maximum
  }
};

const calculateChoiceConfidence = (behaviorAnalysis, patterns, orderHistory) => {
  let confidence = behaviorAnalysis.confidence;

  // Increase confidence if user has consistent patterns
  if (patterns.confidence > 0.7) {
    confidence *= 1.2;
  }

  // Increase confidence if recent orders show consistent behavior
  const recentOrders = orderHistory.slice(0, 5);
  const consistentBehavior = recentOrders.every(order => 
    (order.vivaBucksUsed > 0) === (behaviorAnalysis.preferredStrategy !== 'CONSERVATIVE')
  );

  if (consistentBehavior) {
    confidence *= 1.1;
  }

  return Math.min(confidence, 0.95); // Cap at 95% to maintain humility
};

const generateReasoning = (behaviorAnalysis, optimalAmount, orderData) => {
  if (optimalAmount === 0) {
    return "Based on your savings pattern, keeping VivaBucks for larger purchases";
  }

  const strategy = behaviorAnalysis.preferredStrategy;
  const savings = (optimalAmount * 0.01).toFixed(2);

  switch (strategy) {
    case 'AGGRESSIVE':
      return `You typically maximize savings - using ${optimalAmount} VivaBucks saves $${savings}`;
    case 'CONSERVATIVE':
      return `Keeping most VivaBucks while still saving $${savings} on this order`;
    case 'BALANCED':
      return `Smart balance: save $${savings} now, keep VivaBucks for future purchases`;
    default:
      return `Optimal choice based on your preferences`;
  }
};

const generateNaturalLanguageChoice = (optimalAmount, orderData, behaviorAnalysis) => {
  if (optimalAmount === 0) {
    return "I'll keep your VivaBucks safe for a perfect future purchase! 💎";
  }

  const savings = (optimalAmount * 0.01).toFixed(2);
  const strategy = behaviorAnalysis.preferredStrategy;

  const phrases = {
    AGGRESSIVE: [
      `Let's maximize your savings! Using ${optimalAmount.toLocaleString()} VivaBucks for $${savings} off 🎯`,
      `Going for the gold! $${savings} saved with your VivaBucks 💰`
    ],
    CONSERVATIVE: [
      `Smart savings! Using just ${optimalAmount.toLocaleString()} VivaBucks to save $${savings} 🧠`,
      `A gentle touch: $${savings} off while keeping most VivaBucks for later 🌱`
    ],
    BALANCED: [
      `Perfect balance! Save $${savings} now, keep plenty for next time ⚖️`,
      `The sweet spot: $${savings} savings without overdoing it 🎈`
    ]
  };

  const strategyPhrases = phrases[strategy] || phrases.BALANCED;
  return strategyPhrases[Math.floor(Math.random() * strategyPhrases.length)];
};

const generateAlternativeChoices = (orderData, userData, behaviorAnalysis) => {
  const availableVivaBucks = userData.availableVivaBucks || 0;
  const maxRedemption = Math.min(availableVivaBucks, orderData.total * 10);
  
  const alternatives = [];

  // Always offer "use none" option
  alternatives.push({
    vivaBucks: 0,
    savings: 0,
    description: "Keep all VivaBucks for later",
    confidence: 0.3
  });

  // Offer 25%, 50%, 75% options if significantly different from optimal
  [0.25, 0.5, 0.75].forEach(percentage => {
    const amount = Math.floor(maxRedemption * percentage);
    if (amount >= 50 && amount !== behaviorAnalysis.optimalAmount) {
      alternatives.push({
        vivaBucks: amount,
        savings: (amount * 0.01).toFixed(2),
        description: `Use ${Math.round(percentage * 100)}% of VivaBucks`,
        confidence: 0.5
      });
    }
  });

  return alternatives.slice(0, 3); // Limit to 3 alternatives to avoid choice overload
};

// Additional helper functions for context
const calculateTierProgress = (userData) => {
  const currentPoints = userData.totalVivaBucksEarned || 0;
  const nextTierThreshold = 5000; // Simplified
  return {
    progressPercent: Math.min(100, (currentPoints / nextTierThreshold) * 100)
  };
};

const calculateDaysSinceLastPrescription = (orderHistory) => {
  const prescriptionOrders = orderHistory.filter(order =>
    order.items?.some(item => item.category === 'prescription' || item.isPrescription)
  );
  
  if (prescriptionOrders.length === 0) return 999;
  
  const lastRx = prescriptionOrders[0];
  return Math.floor((Date.now() - new Date(lastRx.createdAt)) / (1000 * 60 * 60 * 24));
};

const findLastBulkOrder = (orderHistory) => {
  return orderHistory.find(order => order.total > 100 || 
    order.items?.reduce((sum, item) => sum + item.quantity, 0) > 10
  );
};

const determinePreferredShipping = (orderHistory) => {
  const shippingChoices = orderHistory
    .map(order => order.shippingMethod)
    .filter(Boolean);
  
  if (shippingChoices.length === 0) {
    return { method: 'standard', confidence: 0.3 };
  }

  const mostCommon = shippingChoices.reduce((acc, method) => {
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const preferred = Object.entries(mostCommon)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    method: preferred[0],
    confidence: preferred[1] / shippingChoices.length
  };
};

const determinePreferredPayment = (orderHistory) => {
  // Simplified - would analyze actual payment method history
  return { method: 'card', confidence: 0.7 };
};

const determineFavoriteCategory = (orderHistory) => {
  const categories = orderHistory
    .flatMap(order => order.items?.map(item => item.category) || [])
    .filter(Boolean);

  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'health';
};

const determinePreferredPriceRange = (orderHistory) => {
  const orderValues = orderHistory.map(order => order.total).filter(Boolean);
  if (orderValues.length === 0) return { min: 0, max: 100 };

  const average = orderValues.reduce((sum, val) => sum + val, 0) / orderValues.length;
  return {
    min: Math.max(0, average * 0.5),
    max: average * 1.5
  };
};

const determinePreferredSort = (orderHistory) => {
  // Analyze if user tends to buy premium vs budget items
  const orderValues = orderHistory.map(order => order.total).filter(Boolean);
  const averageOrder = orderValues.reduce((sum, val) => sum + val, 0) / orderValues.length;
  
  return averageOrder > 75 ? 'price_desc' : 'price_asc'; // Premium vs budget preference
};

export default {
  generateAutomaticChoice,
  convertToNaturalLanguage,
  predictUserNeeds,
  generateContextualAutomation,
  generateSmartDefaults,
  CONFIDENCE_LEVELS,
  LANGUAGE_TEMPLATES
}; 