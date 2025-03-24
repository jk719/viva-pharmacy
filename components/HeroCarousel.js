"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import CarouselEngine from './CarouselEngine';
import DeliverySlide from './slides/DeliverySlide';
import TylaSlide from './slides/TylaSlide';

// Define vector graphics highlighting delivery timeframes with pricing
const vectorGraphics = {
  delivery: {
    main: (
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M85,40H70V25a5,5,0,0,0-5-5H15a5,5,0,0,0-5,5V65a5,5,0,0,0,5,5h5a10,10,0,0,0,20,0H60a10,10,0,0,0,20,0h5a5,5,0,0,0,5-5V55A15,15,0,0,0,85,40ZM30,80a5,5,0,1,1,5-5A5,5,0,0,1,30,80Zm40,0a5,5,0,1,1,5-5A5,5,0,0,1,70,80Zm15-15H82.41A9.94,9.94,0,0,0,70,55a9.94,9.94,0,0,0-12.41,10H42.41A9.94,9.94,0,0,0,30,55a9.94,9.94,0,0,0-12.41,10H15V25H65V65h5V45h15l0,.14A10,10,0,0,1,85,55Z" fill="white"/>
        <path d="M25 40H45V50H25z" fill="white"/>
      </svg>
    ),
    oneHour: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="3" fill="none"/>
        <path d="M40 25V40L50 50" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="18" r="10" fill="none" />
      </svg>
    ),
    threeHour: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="3" fill="none"/>
        <path d="M40 25V40L55 45" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="18" r="10" fill="none" />
      </svg>
    ),
    sameDay: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="15" y="20" width="50" height="45" rx="3" stroke="white" strokeWidth="3" fill="none"/>
        <path d="M15 30H65" stroke="white" strokeWidth="3"/>
        <path d="M25 15V25" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <path d="M55 15V25" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    )
  },
  tyla: {
    main: (
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M65,39.5H59.5V34A8.51,8.51,0,0,0,51,25.5H49A8.51,8.51,0,0,0,40.5,34v5.5H35a7.5,7.5,0,0,0-7.5,7.5v25A7.5,7.5,0,0,0,35,74.5H65a7.5,7.5,0,0,0,7.5-7.5V47A7.5,7.5,0,0,0,65,39.5ZM45.5,34A3.5,3.5,0,0,1,49,30.5h2A3.5,3.5,0,0,1,54.5,34v5.5h-9ZM67.5,67A2.5,2.5,0,0,1,65,69.5H35A2.5,2.5,0,0,1,32.5,67V47A2.5,2.5,0,0,1,35,44.5H65A2.5,2.5,0,0,1,67.5,47Z" fill="white"/>
        <path d="M50 49.5A7.5 7.5 0 1050 64.5 7.5 7.5 0 0050 49.5z" fill="white"/>
      </svg>
    ),
    headache: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M40,15c-13.8,0-25,11.2-25,25s11.2,25,25,25s25-11.2,25-25S53.8,15,40,15z M40,60c-11,0-20-9-20-20s9-20,20-20 s20,9,20,20S51,60,40,60z" fill="white"/>
        <path d="M48,30c0,0-5,2-8,2s-8-2-8-2s1,7,0,10s-2,5-2,5h20c0,0-1-2-2-5S48,30,48,30z" fill="white"/>
        <path d="M35 45L45 45" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    relief: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M40,15c-13.8,0-25,11.2-25,25s11.2,25,25,25s25-11.2,25-25S53.8,15,40,15z M40,60c-11,0-20-9-20-20s9-20,20-20 s20,9,20,20S51,60,40,60z" fill="white"/>
        <path d="M35 45A5 5 0 0045 45" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 35L35 35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M45 35L50 35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }
};

// Define slides configuration with pricing
const slides = [
  {
    id: "delivery",
    title: "Fast & Flexible Delivery",
    subtitle: "MEDICINE DELIVERED",
    description: "Get your medication exactly when you need it.",
    background: "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800",
    component: DeliverySlide,
    vectors: vectorGraphics.delivery,
    highlights: [
      { 
        title: "1-Hour", 
        description: "Urgent",
        label: "1-HR",
        vector: vectorGraphics.delivery.oneHour,
        color: "from-red-500 to-orange-500"
      },
      { 
        title: "3-Hour", 
        description: "Standard",
        label: "3-HR",
        vector: vectorGraphics.delivery.threeHour,
        color: "from-blue-500 to-cyan-500"
      },
      { 
        title: "Same-Day", 
        description: "Routine",
        price: "$0",
        label: "TODAY",
        isFree: true,
        vector: vectorGraphics.delivery.sameDay,
        color: "from-green-500 to-emerald-500"
      }
    ]
  },
  {
    id: "tyla",
    title: "Introducing Tyla",
    subtitle: "NEW SOLUTION",
    description: "Next generation headache & migraine treatment.",
    background: "bg-gradient-to-r from-purple-700 via-fuchsia-600 to-rose-600",
    component: TylaSlide,
    vectors: vectorGraphics.tyla,
    highlights: [
      { 
        title: "Fast Relief", 
        description: "Minutes",
        vector: vectorGraphics.tyla.headache,
        color: "from-purple-500 to-indigo-500"
      },
      { 
        title: "Proven", 
        description: "Safe",
        vector: vectorGraphics.tyla.relief,
        color: "from-fuchsia-500 to-pink-500"
      }
    ]
  }
];

// Move the renderSlide function outside of the main component
const renderSlide = (slide, isMobile) => {
  const isTylaSlide = slide.id === "tyla";
  
  return (
    <div className="relative pt-6 sm:pt-10">
      {/* Main vector graphic */}
      <div className="w-full flex justify-center items-center mb-4 sm:mb-6">
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center floating z-10">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg">
            <div className="w-full h-full">
              {slide.vectors.main}
            </div>
          </div>
          
          <div className="absolute -left-4 top-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/10 floating" 
            data-delay="1.5s">
          </div>
          <div className="absolute -right-4 top-4 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/5 floating" 
            data-delay="0.8s">
          </div>
        </div>
      </div>
      
      {/* Delivery highlights */}
      <div className={`px-2 ${isMobile ? '' : 'sm:px-0'}`}>
        <div className={`grid ${isTylaSlide ? 'grid-cols-2' : 'grid-cols-3'} gap-2 sm:gap-3`}>
          {slide.highlights.map((highlight, index) => (
            <div 
              key={index}
              className={`
                bg-gradient-to-br ${highlight.color} 
                p-2 sm:p-3 rounded-lg shadow-md backdrop-blur-sm 
                hover:shadow-lg transition-shadow duration-300
              `}
              data-delay={`${0.15 * index}s`}
            >
              {highlight.isFree && highlight.price && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full px-2 py-0.5 sm:px-3 sm:py-1 badge-pulse z-10 border border-white/30 sm:border-2">
                  FREE
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="w-7 h-7 sm:w-10 sm:h-10 mb-1 sm:mb-2 pulse relative">
                  {highlight.vector}
                  {highlight.label && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-white text-[8px] sm:text-[10px] font-bold">
                      {highlight.label}
                    </div>
                  )}
                </div>
                <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                  {highlight.title}
                </h3>
                <p className="text-white/80 text-[10px] sm:text-xs mt-0.5">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HeroCarousel() {
  const { data: session } = useSession();
  const [loyaltyBannerVisible, setLoyaltyBannerVisible] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Check if user is authenticated
  const isAuthenticated = !!session?.user;
  
  // Check for loyalty banner visibility and get position
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkBannerVisibility = () => {
      const loyaltyBanner = document.querySelector('.loyalty-banner');
      setLoyaltyBannerVisible(!!loyaltyBanner && loyaltyBanner.offsetHeight > 0);
    };
    
    checkBannerVisibility();
    const timer = setTimeout(checkBannerVisibility, 500);
    
    const observer = new MutationObserver(checkBannerVisibility);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [session]);

  // Animation CSS for gradient backgrounds and SVG animations
  useEffect(() => {
    // Only add animations if user doesn't prefer reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23ffffff' stroke-opacity='0.1' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
        .badge-pulse {
          animation: badge-pulse 2s infinite;
        }
        @keyframes badge-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        .highlight-appear {
          animation: highlight-appear 0.4s forwards;
        }
        @keyframes highlight-appear {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <div className="mx-auto max-w-[1000px]">
      {/* Applied fixed spacing below any header elements */}
      <div 
        className="header-carousel-spacing w-full"
        style={{ 
          height: '12px',
          background: 'transparent' 
        }}
        aria-hidden="true"
      ></div>
      
      <CarouselEngine 
        slides={slides}
        interval={6000}
        renderSlide={(slide) => renderSlide(slide, isMobile)}
        className="shadow-lg carousel-container"
        compact={true}
      />
      
      {/* Add global styles to fix positioning */}
      <style jsx global>{`
        /* Reset main content padding */
        main {
          padding-top: 0 !important;
        }
        
        /* Position carousel with correct spacing */
        .carousel-container {
          position: relative;
          margin-top: ${isAuthenticated ? 
            `calc(var(--navbar-height${isMobile ? '' : '-md'}) + var(--loyalty-banner-height${isMobile ? '' : '-md'}))` : 
            `var(--navbar-height${isMobile ? '' : '-md'})`};
          z-index: 10;
        }
        
        /* Ensure consistency across browsers */
        @media (max-width: 768px) {
          .carousel-container {
            margin-top: ${isAuthenticated ? 
              'calc(var(--navbar-height) + var(--loyalty-banner-height))' : 
              'var(--navbar-height)'};
          }
        }
        
        @media (min-width: 769px) {
          .carousel-container {
            margin-top: ${isAuthenticated ? 
              'calc(var(--navbar-height-md) + var(--loyalty-banner-height-md))' : 
              'var(--navbar-height-md)'};
          }
        }
      `}</style>
    </div>
  );
} 