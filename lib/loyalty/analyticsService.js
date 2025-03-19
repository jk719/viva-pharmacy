export const calculateMetrics = (users) => {
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.loyaltyProgram?.points > 0).length,
    totalPoints: users.reduce((sum, u) => sum + (u.loyaltyProgram?.points || 0), 0),
    averagePoints: Math.round(
      users.reduce((sum, u) => sum + (u.loyaltyProgram?.points || 0), 0) / 
      (users.filter(u => u.loyaltyProgram?.points > 0).length || 1)
    ),
    tierDistribution: users.reduce((acc, user) => {
      const tier = user.loyaltyProgram?.tier || 'None';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {}),
    couponMetrics: {
      total: users.reduce((sum, u) => sum + (u.loyaltyProgram?.coupons?.length || 0), 0),
      used: users.reduce((sum, u) => sum + (u.loyaltyProgram?.coupons?.filter(c => c.isUsed)?.length || 0), 0),
      active: users.reduce((sum, u) => sum + (u.loyaltyProgram?.coupons?.filter(c => !c.isUsed)?.length || 0), 0)
    }
  };
};

export const calculateTrendData = (transactions, days = 30) => {
  const now = new Date();
  const startDate = new Date(now.setDate(now.getDate() - days));
  
  return transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.createdAt).toISOString().split('T')[0];
    if (new Date(transaction.createdAt) >= startDate) {
      acc[date] = acc[date] || { points: 0, count: 0 };
      acc[date].points += transaction.points;
      acc[date].count += 1;
    }
    return acc;
  }, {});
}; 