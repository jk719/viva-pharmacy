export const calculateClientPoints = (amount, multiplier = 1) => {
  const basePoints = Math.floor(amount * 10);
  return Math.floor(basePoints * multiplier);
};

import { TIER_CONFIG } from './tierConfig';

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

/**
 * Returns all progress bar data for the loyalty banner in a single object.
 * @param {number} lifetimeVivaBucks - Total points ever earned by the user
 * @param {number} currentVivaBucks - Current available points (unused)
 * @param {string} currentTier - User's current tier (e.g., BRONZE, SILVER)
 * @param {number} multiplier - VivaBucks multiplier for the user
 * @param {boolean} animate - Whether to show animation label
 * @returns {Object} Progress bar data
 */
export const getProgressBarData = (lifetimeVivaBucks, currentVivaBucks, currentTier, multiplier, animate) => {
  const progressData = calculateProgressToNextTier(lifetimeVivaBucks, TIER_CONFIG);
  return {
    ...progressData,
    nextTierName: progressData.nextTier,
    startVivaBucks: progressData.startPoints,
    endVivaBucks: progressData.endPoints,
    progress: progressData.progress,
    extendedLabel: animate ? "Earning VivaBucks..." : undefined,
    currentTier,
    multiplier,
    currentVivaBucks,
    lifetimeVivaBucks
  };
};