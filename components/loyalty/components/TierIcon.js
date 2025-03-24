'use client';

import { motion } from 'framer-motion';
import { TIER_COLORS, TIER_ICONS } from '../constants/tierConfig';
import { ANIMATIONS } from '../constants/animations';

export default function TierIcon({ tier, size = 'md', animate = true }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const tierColors = TIER_COLORS[tier];
  const Icon = TIER_ICONS[tier];

  const content = (
    <div className={`
      ${sizeClasses[size]}
      rounded-full
      flex
      items-center
      justify-center
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
        ${tierColors?.icon || 'text-gray-600'}
        ${iconSizeClasses[size]}
      `}>
        {Icon}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div {...ANIMATIONS.scaleIn}>
      {content}
    </motion.div>
  );
} 