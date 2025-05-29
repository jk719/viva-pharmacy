"use client";

import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CarouselNavigation from './CarouselNavigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function CarouselEngine({ 
  slides,
  interval = 6000,
  className = "",
  slideContainerClassName = "",
  renderSlide,
  compact = false
}) {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [direction, setDirection] = useState(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timeoutRef = useRef(null);
  const patternId = useId(); // Generate unique ID for patterns
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (autoplay) {
      timeoutRef.current = setTimeout(
        () => {
          const nextIndex = (current + 1) % slides.length;
          setCurrent(nextIndex);
          setDirection(1);
        },
        interval
      );
    }
    return () => resetTimeout();
  }, [current, autoplay, interval, slides.length]);

  const handleDotClick = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 15000);
  };

  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  const variants = prefersReducedMotion ? {
    enter: () => ({ opacity: 0 }),
    center: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    enter: (direction) => ({
      x: direction > 0 ? 600 : -600,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 600 : -600,
      opacity: 0
    })
  };

  return (
    <div 
      className={`relative rounded-lg overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        minHeight: isMobile ? '360px' : '400px',
        maxHeight: isMobile ? '500px' : '600px',
        height: 'auto'
      }}
    >
      {/* Background with blur effect and pattern overlay */}
      <div 
        className={`absolute inset-0 ${slides[current].background} transition-colors duration-1000`}
        style={{ 
          backgroundSize: '200% 200%', 
          animation: prefersReducedMotion ? 'none' : 'gradient 15s ease infinite' 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        {/* Vector background pattern with unique ID */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id={`dots-${patternId}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#dots-${patternId})`} />
          </svg>
        </div>
      </div>

      {/* Content - adjusted padding for mobile */}
      <div className="relative z-10 px-2 sm:px-6 pt-3 sm:pt-10 pb-6 sm:pb-10 max-w-4xl mx-auto">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slides[current].id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 }
            }}
            className={`${slideContainerClassName || "w-full"} overflow-y-auto`}
            style={{ maxHeight: isMobile ? '420px' : 'none' }}
          >
            {/* Header content - adjusted for mobile */}
            <div className="mb-3 sm:mb-5">
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2 space-x-1"
              >
                <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full ${!prefersReducedMotion ? 'animate-pulse' : ''}`}></span>
                <span>{slides[current].subtitle}</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-lg sm:text-2xl font-bold text-white mb-1 leading-tight"
              >
                {slides[current].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl"
              >
                {slides[current].description}
              </motion.p>
            </div>
            
            {/* Slide content */}
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="min-h-[140px] sm:min-h-[220px]"
            >
              {renderSlide ? renderSlide(slides[current], isMobile) : null}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots - adjusted position */}
      <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-20">
        <CarouselNavigation 
          slides={slides}
          currentIndex={current}
          onDotClick={handleDotClick}
          compact={true}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 z-10">
        {!prefersReducedMotion && (
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: interval / 1000, ease: "linear" }}
            key={current}
          />
        )}
      </div>
    </div>
  );
} 