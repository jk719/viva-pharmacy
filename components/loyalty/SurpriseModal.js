'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGift, 
  FaTrophy, 
  FaBirthdayCake, 
  FaRocket, 
  FaStar,
  FaCoins,
  FaSparkles,
  FaHeart,
  FaCrown,
  FaFire
} from 'react-icons/fa';

/**
 * Surprise Modal Component - Phase 3 Implementation
 * 
 * Creates magical celebration experiences for:
 * 1. Random bonus surprises
 * 2. Milestone achievements
 * 3. Birthday magic
 * 4. Tier upgrade celebrations
 * 5. Anniversary commemorations
 */

const SurpriseModal = ({ 
  surprise = null, 
  isVisible = false, 
  onClose,
  onComplete
}) => {
  const [animationPhase, setAnimationPhase] = useState('entrance'); // entrance, celebration, exit
  const [showConfetti, setShowConfetti] = useState(false);
  const [particleCount, setParticleCount] = useState(50);

  useEffect(() => {
    if (isVisible && surprise) {
      setAnimationPhase('entrance');
      
      // Start confetti after entrance
      setTimeout(() => {
        setShowConfetti(true);
        setAnimationPhase('celebration');
      }, 500);

      // Auto-close after celebration duration
      const totalDuration = surprise.duration || 5000;
      setTimeout(() => {
        setAnimationPhase('exit');
        setTimeout(() => {
          setShowConfetti(false);
          onClose?.();
          onComplete?.(surprise);
        }, 500);
      }, totalDuration);
    }
  }, [isVisible, surprise, onClose, onComplete]);

  if (!isVisible || !surprise) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ 
          background: getBackgroundGradient(surprise.type),
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Confetti/Particles */}
        <AnimatePresence>
          {showConfetti && (
            <ConfettiAnimation 
              type={surprise.animation} 
              colors={surprise.colors}
              count={particleCount}
            />
          )}
        </AnimatePresence>

        {/* Main Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ 
            scale: animationPhase === 'celebration' ? [1, 1.05, 1] : 1, 
            opacity: 1, 
            y: 0 
          }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.6, 
            ease: "backOut",
            scale: {
              repeat: animationPhase === 'celebration' ? Infinity : 0,
              repeatDelay: 2,
              duration: 1
            }
          }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Decorative Border */}
          <div className={`absolute inset-0 rounded-2xl ${getBorderStyle(surprise.type)}`} />
          
          {/* Header with Icon */}
          <div className="relative p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: getIconBackground(surprise.type) }}
            >
              {getIcon(surprise.type)}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {surprise.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-gray-600 text-lg"
            >
              {surprise.message}
            </motion.p>
          </div>

          {/* Content based on surprise type */}
          <div className="px-8 pb-8">
            {renderSurpriseContent(surprise)}
          </div>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => {
              setAnimationPhase('exit');
              setTimeout(() => {
                setShowConfetti(false);
                onClose?.();
                onComplete?.(surprise);
              }, 500);
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            ×
          </motion.button>

          {/* Special Effects Overlay */}
          {surprise.specialEffect && (
            <SpecialEffect type={surprise.specialEffect} />
          )}
        </motion.div>

        {/* Sound Effects Trigger */}
        <SoundEffects sounds={surprise.sounds} isPlaying={animationPhase === 'celebration'} />
      </motion.div>
    </AnimatePresence>
  );
};

// Confetti Animation Component
const ConfettiAnimation = ({ type, colors, count }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: `${particle.x}vw`, 
            y: '-10vh', 
            rotate: 0,
            scale: 0 
          }}
          animate={{ 
            x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
            y: '110vh',
            rotate: Math.random() * 720,
            scale: [0, 1, 1, 0]
          }}
          transition={{ 
            delay: particle.delay,
            duration: particle.duration,
            ease: "easeOut"
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: type === 'CONFETTI_EXPLOSION' ? '2px' : '50%'
          }}
        />
      ))}
    </div>
  );
};

// Special Effects Component
const SpecialEffect = ({ type }) => {
  switch (type) {
    case 'RAINBOW_BORDER':
      return (
        <motion.div
          animate={{
            background: [
              'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)',
              'linear-gradient(135deg, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #ff6b6b)',
              'linear-gradient(225deg, #45b7d1, #96ceb4, #feca57, #ff9ff3, #ff6b6b, #4ecdc4)',
              'linear-gradient(315deg, #96ceb4, #feca57, #ff9ff3, #ff6b6b, #4ecdc4, #45b7d1)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
        />
      );
    default:
      return null;
  }
};

// Sound Effects Component (placeholder)
const SoundEffects = ({ sounds, isPlaying }) => {
  useEffect(() => {
    if (isPlaying && sounds && typeof Audio !== 'undefined') {
      // Placeholder for sound effects
      // In a real implementation, you'd load and play audio files
      console.log('Playing sounds:', sounds);
    }
  }, [isPlaying, sounds]);

  return null;
};

// Helper Functions
const getIcon = (type) => {
  const iconProps = { className: "text-3xl text-white" };
  
  switch (type) {
    case 'RANDOM_BONUS':
      return <FaGift {...iconProps} />;
    case 'MILESTONE_CELEBRATION':
      return <FaTrophy {...iconProps} />;
    case 'BIRTHDAY_MAGIC':
      return <FaBirthdayCake {...iconProps} />;
    case 'TIER_UPGRADE_CELEBRATION':
      return <FaRocket {...iconProps} />;
    case 'LOYALTY_ANNIVERSARY':
      return <FaCrown {...iconProps} />;
    default:
      return <FaStar {...iconProps} />;
  }
};

const getBackgroundGradient = (type) => {
  switch (type) {
    case 'RANDOM_BONUS':
      return 'linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(78, 205, 196, 0.9))';
    case 'MILESTONE_CELEBRATION':
      return 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 165, 0, 0.9))';
    case 'BIRTHDAY_MAGIC':
      return 'linear-gradient(135deg, rgba(255, 105, 180, 0.9), rgba(221, 160, 221, 0.9))';
    case 'TIER_UPGRADE_CELEBRATION':
      return 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(129, 199, 132, 0.9))';
    case 'LOYALTY_ANNIVERSARY':
      return 'linear-gradient(135deg, rgba(156, 39, 176, 0.9), rgba(186, 104, 200, 0.9))';
    default:
      return 'linear-gradient(135deg, rgba(69, 183, 209, 0.9), rgba(150, 206, 180, 0.9))';
  }
};

const getIconBackground = (type) => {
  switch (type) {
    case 'RANDOM_BONUS':
      return 'linear-gradient(135deg, #ff6b6b, #4ecdc4)';
    case 'MILESTONE_CELEBRATION':
      return 'linear-gradient(135deg, #ffd700, #ffa500)';
    case 'BIRTHDAY_MAGIC':
      return 'linear-gradient(135deg, #ff69b4, #dda0dd)';
    case 'TIER_UPGRADE_CELEBRATION':
      return 'linear-gradient(135deg, #4caf50, #81c784)';
    case 'LOYALTY_ANNIVERSARY':
      return 'linear-gradient(135deg, #9c27b0, #ba68c8)';
    default:
      return 'linear-gradient(135deg, #45b7d1, #96ceb4)';
  }
};

const getBorderStyle = (type) => {
  switch (type) {
    case 'RANDOM_BONUS':
      return 'bg-gradient-to-r from-red-200 to-teal-200 p-1';
    case 'MILESTONE_CELEBRATION':
      return 'bg-gradient-to-r from-yellow-200 to-orange-200 p-1';
    case 'BIRTHDAY_MAGIC':
      return 'bg-gradient-to-r from-pink-200 to-purple-200 p-1';
    case 'TIER_UPGRADE_CELEBRATION':
      return 'bg-gradient-to-r from-green-200 to-emerald-200 p-1';
    case 'LOYALTY_ANNIVERSARY':
      return 'bg-gradient-to-r from-purple-200 to-indigo-200 p-1';
    default:
      return 'bg-gradient-to-r from-blue-200 to-cyan-200 p-1';
  }
};

const renderSurpriseContent = (surprise) => {
  switch (surprise.type) {
    case 'RANDOM_BONUS':
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mb-4"
          >
            <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-700">
              <FaCoins className="text-yellow-500" />
              <span>+{surprise.bonusAmount?.toLocaleString()} VivaBucks!</span>
            </div>
            <p className="text-green-600 text-sm mt-2">
              Worth ${(surprise.bonusAmount * 0.01).toFixed(2)} in savings!
            </p>
          </motion.div>
        </div>
      );

    case 'MILESTONE_CELEBRATION':
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 mb-4"
          >
            <div className="flex items-center justify-center space-x-2 text-xl font-bold text-orange-700">
              <FaTrophy className="text-yellow-500" />
              <span>{surprise.badge} Achievement</span>
            </div>
            {surprise.bonusAmount && (
              <div className="mt-3 text-lg font-semibold text-green-700">
                Bonus: +{surprise.bonusAmount.toLocaleString()} VivaBucks!
              </div>
            )}
          </motion.div>
        </div>
      );

    case 'BIRTHDAY_MAGIC':
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-6 mb-4"
          >
            <div className="flex items-center justify-center space-x-2 text-xl font-bold text-purple-700">
              <FaBirthdayCake className="text-pink-500" />
              <span>{surprise.multiplier}x VivaBucks!</span>
            </div>
            <p className="text-purple-600 text-sm mt-2">
              {surprise.multiplier === 3 ? 'All day long!' : 
               surprise.multiplier === 2.5 ? 'All week long!' : 
               'All month long!'}
            </p>
          </motion.div>
        </div>
      );

    case 'TIER_UPGRADE_CELEBRATION':
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 mb-4"
          >
            <div className="flex items-center justify-center space-x-2 text-xl font-bold text-green-700">
              <FaRocket className="text-blue-500" />
              <span>{surprise.tierBadge} Tier!</span>
            </div>
            {surprise.benefits && (
              <div className="mt-3 text-sm text-green-600">
                <p>New Benefits Unlocked:</p>
                <ul className="list-disc list-inside mt-1">
                  {surprise.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      );

    case 'LOYALTY_ANNIVERSARY':
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-6 mb-4"
          >
            <div className="flex items-center justify-center space-x-2 text-xl font-bold text-purple-700">
              <FaCrown className="text-yellow-500" />
              <span>Anniversary Celebration!</span>
            </div>
            {surprise.bonusAmount && (
              <div className="mt-3">
                <div className="text-lg font-semibold text-green-700">
                  +{surprise.bonusAmount.toLocaleString()} VivaBucks!
                </div>
                <p className="text-purple-600 text-sm mt-1">
                  Thank you for your loyalty! 💜
                </p>
              </div>
            )}
          </motion.div>
        </div>
      );

    default:
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", bounce: 0.5 }}
            className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-6"
          >
            <FaSparkles className="text-4xl text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Something magical happened!</p>
          </motion.div>
        </div>
      );
  }
};

export default SurpriseModal; 