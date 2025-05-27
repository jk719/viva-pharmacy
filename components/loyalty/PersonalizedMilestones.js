'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign, FaCalendarAlt, FaGift, FaTrophy, FaChartLine, FaHeart, FaStar, FaFireAlt } from 'react-icons/fa';
import useImprovedLoyaltyStore from '@/lib/loyalty/improvedLoyaltyStore';

/**
 * Personalized Milestones - Phase 2 Implementation
 * 
 * Features:
 * 1. Personal achievement tracking
 * 2. Meaningful savings metrics
 * 3. Progress towards goals
 * 4. Celebration moments
 */

const PersonalizedMilestones = ({ 
  className = "",
  variant = "full", // "full", "compact", "banner"
  orderHistory = []
}) => {
  const { userData, progressInfo } = useImprovedLoyaltyStore();
  const [milestones, setMilestones] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate personalized milestones
  const calculateMilestones = useMemo(() => {
    if (!userData || !Array.isArray(orderHistory)) return null;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Filter orders for different time periods
    const thisYearOrders = orderHistory.filter(order => 
      new Date(order.createdAt).getFullYear() === currentYear
    );
    
    const thisMonthOrders = orderHistory.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
    });

    // Calculate savings
    const totalSaved = orderHistory.reduce((sum, order) => 
      sum + (order.vivaBucksUsed * 0.01 || 0), 0
    );
    
    const thisYearSaved = thisYearOrders.reduce((sum, order) => 
      sum + (order.vivaBucksUsed * 0.01 || 0), 0
    );

    // Calculate loyalty tenure
    const firstOrder = orderHistory.length > 0 ? 
      new Date(Math.min(...orderHistory.map(o => new Date(o.createdAt)))) : 
      new Date();
    
    const daysSinceFirst = Math.floor((Date.now() - firstOrder.getTime()) / (1000 * 60 * 60 * 24));
    const monthsSinceFirst = Math.floor(daysSinceFirst / 30);

    // VivaBucks metrics
    const totalEarned = userData.totalVivaBucksEarned || 0;
    const available = userData.availableVivaBucks || 0;
    const totalSpent = totalEarned - available;

    // Order patterns
    const averageOrderValue = orderHistory.length > 0 ? 
      orderHistory.reduce((sum, order) => sum + (order.total || 0), 0) / orderHistory.length : 0;

    // Tier progression
    const currentTier = userData.currentTier || 'EXPLORER';
    const nextTierPoints = progressInfo ? progressInfo.pointsToNext : 0;

    return {
      // Personal achievements
      personalStats: {
        totalSaved: totalSaved,
        thisYearSaved: thisYearSaved,
        totalEarned: totalEarned,
        totalOrders: orderHistory.length,
        loyaltyMonths: monthsSinceFirst,
        averageOrderValue: averageOrderValue,
        currentStreak: calculateStreakDays(orderHistory)
      },

      // Current progress
      currentProgress: {
        tier: currentTier,
        pointsToNext: nextTierPoints,
        progressPercent: progressInfo ? progressInfo.progress : 0,
        nextTierName: progressInfo ? progressInfo.nextTier : null
      },

      // Achievements to celebrate
      achievements: generateAchievements(userData, orderHistory, totalSaved),

      // Upcoming milestones
      upcomingMilestones: generateUpcomingMilestones(userData, totalSaved, orderHistory),

      // Personal insights
      insights: generatePersonalInsights(userData, orderHistory, totalSaved)
    };
  }, [userData, orderHistory, progressInfo]);

  useEffect(() => {
    setMilestones(calculateMilestones);
  }, [calculateMilestones]);

  if (!userData || !milestones) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return <CompactMilestones milestones={milestones} className={className} />;
  }

  if (variant === "banner") {
    return <BannerMilestones milestones={milestones} className={className} />;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your VivaBucks Journey</h2>
          <p className="text-sm text-gray-600">
            Member for {milestones.personalStats.loyaltyMonths} months
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${milestones.personalStats.totalSaved.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Saved</div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FaDollarSign className="text-green-500" />}
          title="This Year Saved"
          value={`$${milestones.personalStats.thisYearSaved.toFixed(2)}`}
          subtitle={`${milestones.personalStats.totalOrders} orders`}
        />
        <StatCard
          icon={<FaGift className="text-blue-500" />}
          title="VivaBucks Earned"
          value={milestones.personalStats.totalEarned.toLocaleString()}
          subtitle="Lifetime total"
        />
        <StatCard
          icon={<FaTrophy className="text-purple-500" />}
          title="Current Tier"
          value={milestones.currentProgress.tier}
          subtitle={`${milestones.currentProgress.progressPercent}% to next`}
        />
        <StatCard
          icon={<FaFireAlt className="text-orange-500" />}
          title="Order Streak"
          value={`${milestones.personalStats.currentStreak} days`}
          subtitle="Keep it going!"
        />
      </div>

      {/* Achievements */}
      {milestones.achievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FaStar className="text-yellow-500 mr-2" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {milestones.achievements.slice(0, 3).map((achievement, index) => (
              <AchievementCard key={index} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Milestones */}
      {milestones.upcomingMilestones.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FaChartLine className="text-blue-500 mr-2" />
            Upcoming Milestones
          </h3>
          <div className="space-y-3">
            {milestones.upcomingMilestones.slice(0, 3).map((milestone, index) => (
              <MilestoneCard key={index} milestone={milestone} />
            ))}
          </div>
        </div>
      )}

      {/* Personal Insights */}
      {milestones.insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FaHeart className="text-pink-500 mr-2" />
            Personal Insights
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {milestones.insights.map((insight, index) => (
              <div key={index} className="flex items-start mb-3 last:mb-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="text-sm text-gray-700">{insight}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact variant for sidebars/cards
const CompactMilestones = ({ milestones, className }) => (
  <div className={`bg-white rounded-lg border p-4 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900">Your Progress</h3>
      <span className="text-sm text-green-600 font-medium">
        ${milestones.personalStats.totalSaved.toFixed(2)} saved
      </span>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">This year</span>
        <span className="font-medium">${milestones.personalStats.thisYearSaved.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">VivaBucks earned</span>
        <span className="font-medium">{milestones.personalStats.totalEarned.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Current tier</span>
        <span className="font-medium">{milestones.currentProgress.tier}</span>
      </div>
    </div>

    {milestones.upcomingMilestones.length > 0 && (
      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500 mb-1">Next milestone:</div>
        <div className="text-sm font-medium text-blue-600">
          {milestones.upcomingMilestones[0].title}
        </div>
      </div>
    )}
  </div>
);

// Banner variant for headers
const BannerMilestones = ({ milestones, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <FaTrophy className="text-green-500 mr-3" />
        <div>
          <div className="font-semibold text-gray-900">
            You've saved ${milestones.personalStats.totalSaved.toFixed(2)} with VivaBucks!
          </div>
          <div className="text-sm text-gray-600">
            {milestones.personalStats.totalOrders} orders • {milestones.currentProgress.tier} tier
          </div>
        </div>
      </div>
      
      {milestones.upcomingMilestones.length > 0 && (
        <div className="text-right">
          <div className="text-sm font-medium text-blue-600">
            {milestones.upcomingMilestones[0].title}
          </div>
          <div className="text-xs text-gray-500">
            {milestones.upcomingMilestones[0].progress}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

// Individual components
const StatCard = ({ icon, title, value, subtitle }) => (
  <div className="bg-gray-50 rounded-lg p-3 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-lg font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-600">{title}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

const AchievementCard = ({ achievement }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
  >
    <div className="text-yellow-500 mr-3 text-xl">🏆</div>
    <div>
      <div className="font-medium text-gray-900">{achievement.title}</div>
      <div className="text-sm text-gray-600">{achievement.description}</div>
      {achievement.date && (
        <div className="text-xs text-gray-500 mt-1">{achievement.date}</div>
      )}
    </div>
  </motion.div>
);

const MilestoneCard = ({ milestone }) => (
  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="text-blue-500 mr-3">{milestone.icon}</div>
    <div className="flex-1">
      <div className="font-medium text-gray-900">{milestone.title}</div>
      <div className="text-sm text-gray-600">{milestone.description}</div>
      <div className="text-xs text-blue-600 mt-1">{milestone.progress}</div>
    </div>
  </div>
);

// Helper functions
const calculateStreakDays = (orderHistory) => {
  if (!orderHistory.length) return 0;
  
  const sortedOrders = [...orderHistory].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const order of sortedOrders) {
    const orderDate = new Date(order.createdAt);
    const daysDiff = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 30) { // Within 30 days
      streak = Math.max(streak, daysDiff);
      currentDate = orderDate;
    } else {
      break;
    }
  }
  
  return streak;
};

const generateAchievements = (userData, orderHistory, totalSaved) => {
  const achievements = [];
  
  // Savings milestones
  if (totalSaved >= 100) achievements.push({
    title: "Century Saver",
    description: `You've saved over $${totalSaved.toFixed(2)} with VivaBucks!`,
    date: "Recent achievement"
  });
  
  // Order milestones
  if (orderHistory.length >= 10) achievements.push({
    title: "Loyal Customer",
    description: `${orderHistory.length} orders placed with Viva Pharmacy`,
    date: "Recent achievement"
  });
  
  // VivaBucks milestones
  if (userData.totalVivaBucksEarned >= 5000) achievements.push({
    title: "VivaBucks Master",
    description: `Earned over ${userData.totalVivaBucksEarned.toLocaleString()} VivaBucks`,
    date: "Recent achievement"
  });
  
  return achievements;
};

const generateUpcomingMilestones = (userData, totalSaved, orderHistory) => {
  const milestones = [];
  
  // Next savings milestone
  const nextSavingsGoal = Math.ceil((totalSaved + 1) / 50) * 50;
  const savingsNeeded = nextSavingsGoal - totalSaved;
  
  if (savingsNeeded > 0 && savingsNeeded <= 50) {
    milestones.push({
      title: `$${nextSavingsGoal} Savings Club`,
      description: `Save $${savingsNeeded.toFixed(2)} more to reach this milestone`,
      progress: `${Math.round((totalSaved / nextSavingsGoal) * 100)}% complete`,
      icon: <FaDollarSign className="w-4 h-4" />
    });
  }
  
  // Next order milestone
  const nextOrderGoal = Math.ceil((orderHistory.length + 1) / 10) * 10;
  const ordersNeeded = nextOrderGoal - orderHistory.length;
  
  if (ordersNeeded > 0 && ordersNeeded <= 10) {
    milestones.push({
      title: `${nextOrderGoal} Order Club`,
      description: `${ordersNeeded} more orders to reach this milestone`,
      progress: `${Math.round((orderHistory.length / nextOrderGoal) * 100)}% complete`,
      icon: <FaGift className="w-4 h-4" />
    });
  }
  
  return milestones;
};

const generatePersonalInsights = (userData, orderHistory, totalSaved) => {
  const insights = [];
  
  if (orderHistory.length > 0) {
    const averageOrder = orderHistory.reduce((sum, order) => sum + (order.total || 0), 0) / orderHistory.length;
    insights.push(`Your average order value is $${averageOrder.toFixed(2)}`);
  }
  
  if (totalSaved > 0) {
    const savingsRate = (totalSaved / (userData.totalVivaBucksEarned * 0.01)) * 100;
    insights.push(`You've redeemed ${savingsRate.toFixed(0)}% of your earned VivaBucks`);
  }
  
  const currentTier = userData.currentTier || 'EXPLORER';
  if (currentTier !== 'EXPLORER') {
    insights.push(`You're in the ${currentTier} tier with ${userData.pointsMultiplier}x earning bonus!`);
  }
  
  return insights;
};

export default PersonalizedMilestones; 