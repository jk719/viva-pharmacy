export const calculateClientPoints = (amount, multiplier = 1) => {
  const basePoints = Math.floor(amount * 10);
  return Math.floor(basePoints * multiplier);
};

export const calculateProgressToNextTier = (currentPoints, tiers) => {
  for (const [tier, config] of Object.entries(tiers)) {
    if (currentPoints < config.points) {
      return {
        nextTier: tier,
        pointsNeeded: config.points - currentPoints,
        progress: (currentPoints / config.points) * 100
      };
    }
  }
  return null;
}; 