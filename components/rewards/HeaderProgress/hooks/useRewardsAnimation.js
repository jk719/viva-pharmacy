import { useState, useRef, useCallback } from 'react';
import { calculateProgress } from '../utils/progressCalculator';

export const useRewardsAnimation = (rewardsData, fetchRewardsData) => {
  const [scale, setScale] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef(null);
  const progressRef = useRef(0);
  const lastPointsRef = useRef(0);

  const handleAnimation = useCallback(async (amount) => {
    setIsAnimating(true);
    const currentPoints = rewardsData.rewardPoints || 0;
    const pointsToAdd = Math.floor(amount * REWARD_CONSTANTS.REWARD_RATE.POINTS_PER_DOLLAR);
    const newPoints = currentPoints + pointsToAdd;
    
    const progress = calculateProgress(newPoints);
    progressRef.current = progress;
    
    setScale(progress);
    lastPointsRef.current = newPoints;
    
    timeoutRef.current = setTimeout(async () => {
      await fetchRewardsData();
      setIsAnimating(false);
    }, 1000);
  }, [rewardsData.rewardPoints, fetchRewardsData]);

  return { scale, isAnimating, handleAnimation, timeoutRef };
}; 