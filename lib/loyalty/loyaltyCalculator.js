export const calculateClientPoints = (amount, multiplier = 1) => {
  const basePoints = Math.floor(amount * 10);
  return Math.floor(basePoints * multiplier);
};

export const calculateProgressToNextTier = (currentPoints, tiers) => {
  // Get sorted tiers by points ascending
  const sortedTiers = Object.entries(tiers).sort((a, b) => a[1].points - b[1].points);
  let prevTier = sortedTiers[0]; // Default to BRONZE

  for (const [tier, config] of sortedTiers) {
    if (currentPoints < config.points) {
      const startPoints = prevTier[1].points;
      const endPoints = config.points;
      return {
        nextTier: tier,
        pointsNeeded: endPoints - currentPoints,
        startPoints,
        endPoints,
        progress: ((currentPoints - startPoints) / (endPoints - startPoints)) * 100
      };
    }
    prevTier = [tier, config];
  }
  // If above highest tier
  return {
    nextTier: null,
    pointsNeeded: 0,
    startPoints: prevTier[1].points,
    endPoints: prevTier[1].points,
    progress: 100
  };
}; 