import { REWARD_CONSTANTS } from '@/lib/rewards/constants';

export const calculateProgress = (points) => {
  const pointsNeeded = REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED;
  const pointsInCycle = points % pointsNeeded;
  return (pointsInCycle / pointsNeeded) * 100;
};