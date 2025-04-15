export const calculateMetrics = (users) => {
  // Single pass over users array for better performance
  const metrics = users.reduce((acc, user) => {
    const points = user.loyaltyProgram?.points || 0;
    const tier = user.loyaltyProgram?.tier || 'None';
    const coupons = user.loyaltyProgram?.coupons || [];
    
    // Update points metrics
    acc.totalPoints += points;
    if (points > 0) {
      acc.activeUsers++;
    }
    
    // Update tier distribution
    acc.tierDistribution[tier] = (acc.tierDistribution[tier] || 0) + 1;
    
    // Update coupon metrics
    acc.couponMetrics.total += coupons.length;
    acc.couponMetrics.used += coupons.filter(c => c.isUsed).length;
    acc.couponMetrics.active += coupons.filter(c => !c.isUsed).length;
    
    return acc;
  }, {
    totalUsers: users.length,
    activeUsers: 0,
    totalPoints: 0,
    tierDistribution: {},
    couponMetrics: {
      total: 0,
      used: 0,
      active: 0
    }
  });

  // Calculate average points
  metrics.averagePoints = Math.round(
    metrics.activeUsers > 0 ? metrics.totalPoints / metrics.activeUsers : 0
  );

  return metrics;
};

export const calculateTrendData = (transactions, days = 30) => {
  const now = new Date();
  const startDate = new Date(now.setDate(now.getDate() - days));
  const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });
  
  // Initialize dates array with all days in range
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return dateFormat.format(date);
  }).reverse();
  
  // Process transactions
  const trendData = transactions.reduce((acc, transaction) => {
    const txDate = new Date(transaction.createdAt);
    if (txDate >= startDate) {
      const dateKey = dateFormat.format(txDate);
      
      // Initialize if not exists
      if (!acc[dateKey]) {
        acc[dateKey] = {
          points: 0,
          count: 0,
          avgPointsPerTx: 0,
          uniqueUsers: new Set(),
          totalValue: 0
        };
      }
      
      // Update metrics
      acc[dateKey].points += transaction.points;
      acc[dateKey].count += 1;
      acc[dateKey].uniqueUsers.add(transaction.userId);
      acc[dateKey].totalValue += transaction.value || 0;
      acc[dateKey].avgPointsPerTx = acc[dateKey].points / acc[dateKey].count;
    }
    return acc;
  }, {});

  // Ensure all dates are present and convert Sets to counts
  return dates.reduce((acc, date) => {
    acc[date] = {
      points: trendData[date]?.points || 0,
      count: trendData[date]?.count || 0,
      avgPointsPerTx: trendData[date]?.avgPointsPerTx || 0,
      uniqueUsers: trendData[date]?.uniqueUsers?.size || 0,
      totalValue: trendData[date]?.totalValue || 0
    };
    return acc;
  }, {});
}; 