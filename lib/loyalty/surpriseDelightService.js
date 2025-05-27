/**
 * Surprise & Delight Service - Phase 3 Implementation
 * 
 * Creates magical moments through:
 * 1. Random bonus celebrations
 * 2. Personal milestone recognition  
 * 3. Birthday magic
 * 4. Achievement unlock animations
 * 5. Strategic timing for maximum impact
 */

// Surprise types and their configurations
const SURPRISE_TYPES = {
  RANDOM_BONUS: {
    name: 'Random Bonus VivaBucks',
    frequency: 0.06, // 6% of orders
    minAmount: 50,
    maxAmount: 500,
    timing: 'POST_ORDER'
  },
  MILESTONE_CELEBRATION: {
    name: 'Milestone Achievement',
    frequency: 0.02, // 2% of orders (based on milestones)
    timing: 'MILESTONE_REACHED'
  },
  BIRTHDAY_MAGIC: {
    name: 'Birthday Surprise',
    frequency: 1.0, // 100% during birthday period
    timing: 'BIRTHDAY_PERIOD'
  },
  TIER_UPGRADE_CELEBRATION: {
    name: 'Tier Upgrade Party',
    frequency: 1.0, // 100% on tier upgrades
    timing: 'TIER_ACHIEVED'
  },
  LOYALTY_ANNIVERSARY: {
    name: 'Loyalty Anniversary',
    frequency: 1.0, // 100% on anniversary
    timing: 'ANNIVERSARY'
  }
};

// Milestone definitions
const MILESTONES = {
  FIRST_ORDER: { threshold: 1, bonus: 100, message: "Welcome to VivaBucks! Here's a surprise!" },
  LOYAL_CUSTOMER: { threshold: 10, bonus: 200, message: "10 orders! You're officially a loyal customer!" },
  FREQUENT_SHOPPER: { threshold: 25, bonus: 300, message: "25 orders - you're amazing! Bonus VivaBucks!" },
  VIP_STATUS: { threshold: 50, bonus: 500, message: "50 orders! VIP status unlocked!" },
  CENTURY_CLUB: { threshold: 100, bonus: 1000, message: "100 orders! Welcome to the Century Club!" }
};

// Birthday period definitions
const BIRTHDAY_PERIODS = {
  BIRTHDAY_MONTH: { duration: 30, multiplier: 2.0, message: "Happy Birthday Month! 2x VivaBucks all month!" },
  BIRTHDAY_WEEK: { duration: 7, multiplier: 2.5, message: "Birthday week magic! 2.5x VivaBucks!" },
  BIRTHDAY_DAY: { duration: 1, multiplier: 3.0, message: "Happy Birthday! 3x VivaBucks today!" }
};

/**
 * Check if user is eligible for a surprise
 */
export const checkSurpriseEligibility = (userData = {}, orderData = {}, orderHistory = []) => {
  const eligibleSurprises = [];
  
  // Random bonus eligibility
  if (shouldTriggerRandomBonus(userData, orderData, orderHistory)) {
    const bonusAmount = calculateRandomBonus(userData, orderData);
    eligibleSurprises.push({
      type: 'RANDOM_BONUS',
      config: SURPRISE_TYPES.RANDOM_BONUS,
      details: {
        bonusAmount,
        reason: determineRandomBonusReason(userData, orderData, orderHistory),
        celebration: true
      }
    });
  }

  // Milestone celebrations
  const milestoneAchieved = checkMilestoneAchievement(orderHistory);
  if (milestoneAchieved) {
    eligibleSurprises.push({
      type: 'MILESTONE_CELEBRATION',
      config: SURPRISE_TYPES.MILESTONE_CELEBRATION,
      details: milestoneAchieved
    });
  }

  // Birthday magic
  const birthdayStatus = checkBirthdayEligibility(userData);
  if (birthdayStatus.eligible) {
    eligibleSurprises.push({
      type: 'BIRTHDAY_MAGIC',
      config: SURPRISE_TYPES.BIRTHDAY_MAGIC,
      details: birthdayStatus
    });
  }

  // Tier upgrade celebration
  if (orderData.tierUpgrade) {
    eligibleSurprises.push({
      type: 'TIER_UPGRADE_CELEBRATION',
      config: SURPRISE_TYPES.TIER_UPGRADE_CELEBRATION,
      details: {
        newTier: orderData.newTier,
        previousTier: orderData.previousTier,
        benefits: orderData.newTierBenefits,
        celebration: true
      }
    });
  }

  // Loyalty anniversary
  const anniversaryStatus = checkAnniversaryEligibility(userData, orderHistory);
  if (anniversaryStatus.eligible) {
    eligibleSurprises.push({
      type: 'LOYALTY_ANNIVERSARY',
      config: SURPRISE_TYPES.LOYALTY_ANNIVERSARY,
      details: anniversaryStatus
    });
  }

  return eligibleSurprises.sort((a, b) => b.details.priority || 0 - a.details.priority || 0);
};

/**
 * Generate surprise celebration data
 */
export const generateSurpriseCelebration = (surpriseType, userData = {}, details = {}) => {
  const timestamp = new Date().toISOString();
  
  switch (surpriseType) {
    case 'RANDOM_BONUS':
      return {
        id: `surprise_${Date.now()}`,
        type: 'RANDOM_BONUS',
        title: "🎉 Surprise VivaBucks!",
        message: details.reason || "You're awesome! Here's a surprise bonus!",
        animation: 'FIREWORKS',
        bonusAmount: details.bonusAmount,
        duration: 5000,
        timestamp,
        celebrationLevel: 'HIGH',
        sounds: ['surprise', 'coins'],
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
      };

    case 'MILESTONE_CELEBRATION':
      return {
        id: `milestone_${Date.now()}`,
        type: 'MILESTONE_CELEBRATION',
        title: `🏆 ${details.milestone} Achievement!`,
        message: details.message,
        animation: 'CONFETTI_EXPLOSION',
        bonusAmount: details.bonus,
        duration: 6000,
        timestamp,
        celebrationLevel: 'EPIC',
        sounds: ['achievement', 'fanfare'],
        colors: ['#FFD700', '#FFA500', '#FF69B4'],
        badge: details.milestone
      };

    case 'BIRTHDAY_MAGIC':
      return {
        id: `birthday_${Date.now()}`,
        type: 'BIRTHDAY_MAGIC',
        title: `🎂 ${details.period === 'DAY' ? 'Happy Birthday!' : 'Birthday ' + details.period + '!'}`,
        message: details.message,
        animation: 'BIRTHDAY_SPARKLES',
        multiplier: details.multiplier,
        duration: 7000,
        timestamp,
        celebrationLevel: 'MAGICAL',
        sounds: ['birthday', 'sparkles'],
        colors: ['#FF69B4', '#FFB6C1', '#DDA0DD'],
        specialEffect: 'RAINBOW_BORDER'
      };

    case 'TIER_UPGRADE_CELEBRATION':
      return {
        id: `tier_${Date.now()}`,
        type: 'TIER_UPGRADE_CELEBRATION',
        title: `🚀 ${details.newTier} Tier Unlocked!`,
        message: `Welcome to ${details.newTier} tier! Enjoy your new benefits!`,
        animation: 'TIER_UPGRADE_GLOW',
        benefits: details.benefits,
        duration: 8000,
        timestamp,
        celebrationLevel: 'EPIC',
        sounds: ['upgrade', 'success'],
        colors: ['#4CAF50', '#81C784', '#A5D6A7'],
        tierBadge: details.newTier
      };

    case 'LOYALTY_ANNIVERSARY':
      return {
        id: `anniversary_${Date.now()}`,
        type: 'LOYALTY_ANNIVERSARY',
        title: `🎊 ${details.years} Year${details.years > 1 ? 's' : ''} of Loyalty!`,
        message: details.message,
        animation: 'ANNIVERSARY_CASCADE',
        bonusAmount: details.bonus,
        duration: 6000,
        timestamp,
        celebrationLevel: 'EPIC',
        sounds: ['celebration', 'achievement'],
        colors: ['#9C27B0', '#BA68C8', '#CE93D8'],
        commemorative: true
      };

    default:
      return null;
  }
};

/**
 * Calculate surprise timing for maximum impact
 */
export const calculateOptimalSurpriseTiming = (userData = {}, orderHistory = []) => {
  const now = new Date();
  const recentOrders = orderHistory.slice(0, 10);
  
  // Analyze user's rough periods (low activity, failed transactions, etc.)
  const roughPeriods = identifyRoughPeriods(orderHistory);
  const currentlyInRoughPeriod = roughPeriods.some(period => 
    now >= new Date(period.start) && now <= new Date(period.end)
  );

  // Check if user is close to tier upgrade (frustration zone)
  const tierProgression = calculateTierProgress(userData);
  const nearTierUpgrade = tierProgression.progressPercent > 75 && tierProgression.progressPercent < 100;

  // Analyze engagement patterns
  const lastOrderDays = recentOrders.length > 0 ? 
    Math.floor((now - new Date(recentOrders[0].createdAt)) / (1000 * 60 * 60 * 24)) : 999;
  const inactivityPeriod = lastOrderDays > 30;

  return {
    optimalTiming: true,
    reasons: [
      ...(currentlyInRoughPeriod ? ["User experiencing recent challenges"] : []),
      ...(nearTierUpgrade ? ["Close to tier upgrade - motivation boost"] : []),
      ...(inactivityPeriod ? ["Long inactivity - re-engagement surprise"] : [])
    ],
    impactScore: (currentlyInRoughPeriod ? 3 : 0) + (nearTierUpgrade ? 2 : 0) + (inactivityPeriod ? 2 : 0),
    suggestedDelay: 0 // Immediate for maximum impact
  };
};

/**
 * Track and prevent surprise fatigue
 */
export const manageSurpriseFrequency = (userData = {}, recentSurprises = []) => {
  const now = new Date();
  const last30Days = recentSurprises.filter(surprise => 
    (now - new Date(surprise.timestamp)) < (30 * 24 * 60 * 60 * 1000)
  );

  const surpriseCount = last30Days.length;
  const optimalFrequency = 2; // 2 surprises per month is ideal
  
  return {
    canReceiveSurprise: surpriseCount < optimalFrequency * 1.5, // Allow some flexibility
    currentFrequency: surpriseCount,
    optimalFrequency,
    nextEligibleDate: surpriseCount >= optimalFrequency ? 
      new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) : now, // Wait 1 week if over limit
    fatigueRisk: surpriseCount > optimalFrequency ? 'HIGH' : 'LOW'
  };
};

// Helper Functions

const shouldTriggerRandomBonus = (userData, orderData, orderHistory) => {
  // Base probability
  let probability = SURPRISE_TYPES.RANDOM_BONUS.frequency;
  
  // Increase probability for strategic moments
  const timing = calculateOptimalSurpriseTiming(userData, orderHistory);
  if (timing.impactScore > 2) {
    probability *= 2; // Double probability during strategic moments
  }

  // Increase for loyal customers
  if (orderHistory.length > 20) {
    probability *= 1.5;
  }

  // Decrease for recent recipients
  const recentSurprises = userData.recentSurprises || [];
  const recentBonus = recentSurprises.find(s => 
    s.type === 'RANDOM_BONUS' && 
    (Date.now() - new Date(s.timestamp).getTime()) < (14 * 24 * 60 * 60 * 1000)
  );
  
  if (recentBonus) {
    probability *= 0.1; // Very low if recent bonus
  }

  return Math.random() < probability;
};

const calculateRandomBonus = (userData, orderData) => {
  const baseAmount = 100;
  const orderMultiplier = Math.min(3, (orderData.total || 50) / 50); // Max 3x for large orders
  const tierMultiplier = userData.pointsMultiplier || 1;
  
  return Math.floor(baseAmount * orderMultiplier * tierMultiplier);
};

const determineRandomBonusReason = (userData, orderData, orderHistory) => {
  const reasons = [
    "You're an amazing customer! Here's a surprise!",
    "Random acts of kindness deserve random VivaBucks!",
    "Your loyalty means everything to us!",
    "Surprise! Because you're awesome!",
    "A little gift from the VivaBucks fairy! ✨",
    "You've been great to us, so here's something great for you!",
    "Random bonus time! You deserve this!",
    "Your smile is worth more than VivaBucks, but here's some anyway!"
  ];

  // Add contextual reasons
  if (orderHistory.length > 25) {
    reasons.push("Long-time loyalty deserves special recognition!");
  }
  
  if (orderData.total > 100) {
    reasons.push("Big orders deserve big surprises!");
  }

  return reasons[Math.floor(Math.random() * reasons.length)];
};

const checkMilestoneAchievement = (orderHistory) => {
  const orderCount = orderHistory.length;
  
  for (const [milestone, config] of Object.entries(MILESTONES)) {
    if (orderCount === config.threshold) {
      return {
        milestone,
        message: config.message,
        bonus: config.bonus,
        orderCount,
        celebration: true,
        priority: 3
      };
    }
  }
  
  return null;
};

const checkBirthdayEligibility = (userData) => {
  if (!userData.dateOfBirth) {
    return { eligible: false };
  }

  const now = new Date();
  const birthday = new Date(userData.dateOfBirth);
  const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
  
  // Check if it's birthday period
  const daysDiff = Math.abs((now - thisYearBirthday) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 0.5) { // Birthday day
    return {
      eligible: true,
      period: 'DAY',
      multiplier: BIRTHDAY_PERIODS.BIRTHDAY_DAY.multiplier,
      message: BIRTHDAY_PERIODS.BIRTHDAY_DAY.message,
      priority: 5
    };
  } else if (daysDiff <= 3.5) { // Birthday week
    return {
      eligible: true,
      period: 'WEEK',
      multiplier: BIRTHDAY_PERIODS.BIRTHDAY_WEEK.multiplier,
      message: BIRTHDAY_PERIODS.BIRTHDAY_WEEK.message,
      priority: 4
    };
  } else if (daysDiff <= 15) { // Birthday month
    return {
      eligible: true,
      period: 'MONTH',
      multiplier: BIRTHDAY_PERIODS.BIRTHDAY_MONTH.multiplier,
      message: BIRTHDAY_PERIODS.BIRTHDAY_MONTH.message,
      priority: 3
    };
  }

  return { eligible: false };
};

const checkAnniversaryEligibility = (userData, orderHistory) => {
  if (!orderHistory.length) return { eligible: false };

  const firstOrderDate = new Date(orderHistory[orderHistory.length - 1].createdAt);
  const now = new Date();
  const daysSinceFirst = Math.floor((now - firstOrderDate) / (1000 * 60 * 60 * 24));
  const years = Math.floor(daysSinceFirst / 365);
  
  // Check if it's within 3 days of anniversary
  const daysToAnniversary = Math.abs(daysSinceFirst % 365);
  const nearAnniversary = daysToAnniversary <= 3 || daysToAnniversary >= 362;

  if (years > 0 && nearAnniversary) {
    return {
      eligible: true,
      years,
      message: `${years} year${years > 1 ? 's' : ''} of amazing loyalty! Thank you!`,
      bonus: years * 250, // 250 VivaBucks per year
      commemorative: true,
      priority: 4
    };
  }

  return { eligible: false };
};

const identifyRoughPeriods = (orderHistory) => {
  // This would analyze failed transactions, customer service contacts, etc.
  // For now, return empty array - would need integration with customer service data
  return [];
};

const calculateTierProgress = (userData) => {
  // Simplified version - would use actual tier calculation
  const currentPoints = userData.totalVivaBucksEarned || 0;
  const nextTierThreshold = 5000; // Simplified
  const progressPercent = Math.min(100, (currentPoints / nextTierThreshold) * 100);
  
  return { progressPercent };
};

export default {
  checkSurpriseEligibility,
  generateSurpriseCelebration,
  calculateOptimalSurpriseTiming,
  manageSurpriseFrequency,
  SURPRISE_TYPES,
  MILESTONES,
  BIRTHDAY_PERIODS
}; 