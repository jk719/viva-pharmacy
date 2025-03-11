import { motion } from 'framer-motion';

const ProgressBar = ({ scale, isAnimating }) => {
  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600"
        style={{
          width: '100%',
          transformOrigin: '0%',
        }}
        animate={{
          scaleX: scale / 100,
        }}
        transition={{
          duration: isAnimating ? 1 : 0,
          ease: "easeOut"
        }}
      />
    </div>
  );
};

export default ProgressBar;