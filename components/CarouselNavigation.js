// REMOVED: import React from 'react'; - Not needed in Next.js 13+ with automatic JSX transform
import { motion } from 'framer-motion';

export default function CarouselNavigation({ 
  slides, 
  currentIndex, 
  onDotClick, 
  className = "",
  compact = false,
  prefersReducedMotion = false
}) {
  return (
    <div className={`flex justify-center space-x-2 z-20 ${className}`}>
      {slides.map((slide, index) => (
        <button
          key={slide.id || index}
          onClick={() => onDotClick(index)}
          className="group focus:outline-none focus:ring-2 focus:ring-white/50 relative"
          aria-label={`Go to slide ${index + 1}: ${slide.title || ''}`}
        >
          <div className={`${compact ? 'w-6' : 'w-8'} h-1.5 relative overflow-hidden rounded-full`}>
            <span className={`absolute inset-0 transition-all duration-300 ${
              index === currentIndex ? 'bg-white/40' : 'bg-white/20 group-hover:bg-white/30'
            }`}></span>
            
            {index === currentIndex && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ 
                  duration: 6, // Match interval/1000
                  ease: "linear",
                  repeat: Infinity
                }}
              />
            )}
          </div>
          
          {/* Tooltip for accessibility */}
          <span className="sr-only">{slide.title}</span>
        </button>
      ))}
    </div>
  );
} 