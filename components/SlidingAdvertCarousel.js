"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    title: "Introducing Tyla",
    subtitle: "A breakthrough in pain relief",
    description: "Fast-acting, long-lasting relief for headaches and migraines",
    ctaText: "Learn More",
    ctaLink: "/products/tyla",
    color: "from-rose-500 to-purple-600",
    icon: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Tyla for Migraines",
    subtitle: "Clinically proven relief",
    description: "Effective for 95% of patients in clinical trials",
    ctaText: "Shop Now",
    ctaLink: "/products/tyla-migraine",
    color: "from-blue-500 to-cyan-500",
    icon: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Tyla Subscription",
    subtitle: "Never run out",
    description: "Save 15% with regular deliveries of Tyla to your door",
    ctaText: "Subscribe & Save",
    ctaLink: "/subscription/tyla",
    color: "from-amber-500 to-orange-500",
    icon: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function SlidingAdvertCarousel() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (autoplay) {
      timeoutRef.current = setTimeout(
        () => setCurrent((prevIndex) => (prevIndex + 1) % slides.length),
        5000 // 5 seconds per slide
      );
    }
    return () => resetTimeout();
  }, [current, autoplay]);

  const handleDotClick = (index) => {
    setCurrent(index);
    setAutoplay(false); // Pause autoplay when user interacts
    // Resume autoplay after 8 seconds of inactivity
    setTimeout(() => setAutoplay(true), 8000);
  };

  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  return (
    <div 
      className="relative w-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="p-5 md:p-6"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Content */}
              <div className="text-white">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${slides[current].color} mb-3`}>
                  {slides[current].icon}
                  <span className="font-medium text-sm">New Product</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">{slides[current].title}</h3>
                <p className="text-white/80 text-sm md:text-base mb-1">{slides[current].subtitle}</p>
                <p className="text-white/60 text-sm mb-4 max-w-lg">{slides[current].description}</p>
                <Link 
                  href={slides[current].ctaLink} 
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${slides[current].color} hover:shadow-lg transition-all`}
                >
                  {slides[current].ctaText}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* Right: Visual */}
              <div className="flex-shrink-0">
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${slides[current].color} p-2 flex items-center justify-center relative`}>
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                  <div className="relative z-10 font-bold text-4xl md:text-5xl text-white">Tyla</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Arrow Navigation */}
        <button
          onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white backdrop-blur-sm transition-all"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrent((current + 1) % slides.length)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white backdrop-blur-sm transition-all"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
} 