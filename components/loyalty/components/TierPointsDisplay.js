'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaGift, FaArrowUp } from 'react-icons/fa';
import { IoMdStar } from 'react-icons/io';
import { TIER_COLORS, TIER_ICONS } from '../constants/tierConfig';
import { ANIMATIONS, BADGE_ANIMATIONS } from '../constants/animations';

// Counter animation component
const CounterAnimation = ({ value, duration = 1500 }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
};

export default function TierPointsDisplay({
  currentTier,
  points,
  multiplier,
  isMobile = false,
  animate = true,
  showBadges = true
}) {
  const tierColors = TIER_COLORS[currentTier];
  const Icon = TIER_ICONS[currentTier];

  const content = (
    <div className="flex items-center space-x-2 md:space-x-4 flex-1 z-10">
      {/* Tier icon */}
      <div className={`
        flex
        items-center
        justify-center
        ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}
        rounded-full
        relative
        shadow-sm
      `}>
        <div className={`
          absolute
          inset-0
          rounded-full
          bg-gradient-to-br
          ${tierColors?.bg || 'from-gray-100 to-gray-300'}
          opacity-60
        `} />
        <div className={`
          relative
          z-20
          ${isMobile ? 'scale-90' : 'scale-110'}
          ${tierColors?.icon || 'text-gray-600'}
        `}>
          {Icon}
        </div>
      </div>

      {/* Tier and points info */}
      <div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <h3 className={`
            ${isMobile ? 'text-xs' : 'text-sm md:text-base'}
            font-bold
            tracking-wider
            uppercase
            ${tierColors?.text || 'text-gray-700'}
          `}>
            {currentTier}
          </h3>
          <span className={`
            ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs md:text-sm px-2 py-0.5'}
            rounded-full
            text-white
            font-semibold
            bg-gradient-to-r
            from-[#FF6B00]
            to-[#FF9F43]
          `}>
            {multiplier}x
          </span>
        </div>

        {/* Points display */}
        <div className="flex items-baseline space-x-1 md:space-x-2 mt-0.5 md:mt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`points-${points}`}
              className="flex items-center"
              {...ANIMATIONS.pointsCounter}
            >
              <div className="relative mr-1 md:mr-1.5">
                <FaCoins className={`
                  ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}
                  ${animate ? 'text-[#FFD700]' : 'text-[#FF6B00]'}
                `} />
              </div>
              <span className={`
                ${isMobile ? 'text-sm' : 'text-base md:text-xl'}
                font-extrabold
                transition-all
                duration-500
                ${animate ? 'text-[#FF6B00] scale-110' : 'text-gray-800'}
              `}>
                <CounterAnimation value={points} />
              </span>
            </motion.div>
          </AnimatePresence>
          <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-gray-500`}>
            VivaBucks
          </span>
        </div>

        {/* Badges */}
        {showBadges && (
          <motion.div 
            className="flex space-x-1 md:space-x-2 mt-1 md:mt-2"
            {...BADGE_ANIMATIONS.container}
          >
            {/* First Purchase Badge */}
            <motion.div {...BADGE_ANIMATIONS.item} className={`
              ${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'}
              rounded-full
              bg-gradient-to-r
              from-green-400
              to-green-500
              text-white
              font-medium
              flex
              items-center
            `}>
              <FaGift className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} />
              <span>First Purchase</span>
            </motion.div>

            {/* Loyal Customer Badge */}
            <motion.div {...BADGE_ANIMATIONS.item} className={`
              ${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'}
              rounded-full
              bg-gradient-to-r
              from-blue-400
              to-blue-500
              text-white
              font-medium
              flex
              items-center
            `}>
              <IoMdStar className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} />
              <span>Loyal Customer</span>
            </motion.div>

            {/* Referral Badge */}
            <motion.div {...BADGE_ANIMATIONS.item} className={`
              ${isMobile ? 'text-[6px] px-1 py-0.5' : 'text-[8px] px-1.5 py-0.5'}
              rounded-full
              bg-gradient-to-r
              from-purple-400
              to-purple-500
              text-white
              font-medium
              flex
              items-center
            `}>
              <FaArrowUp className={`${isMobile ? 'h-1.5 w-1.5' : 'h-2 w-2'} mr-0.5`} />
              <span>Referral Pro</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div {...ANIMATIONS.fadeIn}>
      {content}
    </motion.div>
  );
} 