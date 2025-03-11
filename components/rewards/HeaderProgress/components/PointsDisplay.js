import { REWARD_CONSTANTS } from '@/lib/rewards/constants';
import { motion } from 'framer-motion';

const PointsDisplay = ({ rewardsData, isAnimating }) => {
  const pointsNeeded = REWARD_CONSTANTS.REWARD_RATE.POINTS_NEEDED;
  const currentPoints = rewardsData.rewardPoints || 0;
  const pointsInCycle = currentPoints % pointsNeeded;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <motion.span
        key={currentPoints}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isAnimating ? 0.5 : 0 }}
      >
        {pointsInCycle.toLocaleString()}
      </motion.span>
      <span>/</span>
      <span>{pointsNeeded.toLocaleString()}</span>
      <span>points</span>
    </div>
  );
};

export default PointsDisplay;
