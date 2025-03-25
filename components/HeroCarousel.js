"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import CarouselEngine from './CarouselEngine';
import DeliverySlide from './slides/DeliverySlide';
import TylaSlide from './slides/TylaSlide';
import { TIER_CONFIG } from '@/lib/loyalty/tierConfig';

// Define vector graphics highlighting delivery timeframes with pricing
const vectorGraphics = {
  delivery: {
    main: (
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M85 40H70V25a5 5 0 00-5-5H15a5 5 0 00-5 5v40a5 5 0 005 5h5a10 10 0 0020 0h20a10 10 0 0020 0h5a5 5 0 005-5V55a15 15 0 00-5-15zM30 80a5 5 0 110-10 5 5 0 010 10zm40 0a5 5 0 110-10 5 5 0 010 10zm15-15H82.41A9.94 9.94 0 0070 55a9.94 9.94 0 00-12.41 10H42.41A9.94 9.94 0 0030 55a9.94 9.94 0 00-12.41 10H15V25h50v40h5V45h15l0 .14A10 10 0 0185 55z" fill="currentColor"/>
        <path d="M25 40H45V50H25z" fill="currentColor"/>
      </svg>
    ),
    oneHour: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M40 15C26.2 15 15 26.2 15 40s11.2 25 25 25 25-11.2 25-25S53.8 15 40 15zm0 45c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" fill="currentColor"/>
        <path d="M40 25v15l10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M55 20l5-5M25 20l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    threeHour: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M40 15C26.2 15 15 26.2 15 40s11.2 25 25 25 25-11.2 25-25S53.8 15 40 15zm0 45c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" fill="currentColor"/>
        <path d="M40 25v15l15 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 15v-5M40 70v-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    sameDay: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 25h40v35H20z" stroke="currentColor" strokeWidth="3" fill="none"/>
        <path d="M15 25h50M30 15v10M50 15v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M35 40l5 5 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  tyla: {
    main: (
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M50 15c-19.33 0-35 15.67-35 35s15.67 35 35 35 35-15.67 35-35S69.33 15 50 15zm0 65c-16.57 0-30-13.43-30-30s13.43-30 30-30 30 13.43 30 30-13.43 30-30 30z" fill="currentColor"/>
        <path d="M35 45c0-8.28 6.72-15 15-15s15 6.72 15 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M35 55h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    headache: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M40 20c-11.05 0-20 8.95-20 20s8.95 20 20 20 20-8.95 20-20-8.95-20-20-20z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M30 45l20-5M30 35l20 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M25 40h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 4"/>
      </svg>
    ),
    relief: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M40 20c-11.05 0-20 8.95-20 20s8.95 20 20 20 20-8.95 20-20-8.95-20-20-20z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M30 45c5-8 15-8 20 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M30 35h5M45 35h5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    )
  },
  rewards: {
    main: (
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M50 20l-8 16-18 2.6 13 12.7L34 70l16-8.4 16 8.4-3-18.7 13-12.7-18-2.6-8-16z" fill="currentColor"/>
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6"/>
      </svg>
    ),
    points: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="3"/>
        <path d="M35 45l10-10M35 35l10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 25v30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    multiplier: (
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M25 40h30M40 25v30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M55 25l5 5M25 55l5 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4"/>
      </svg>
    )
  }
};

// Add bullet point icons
const bulletIcons = {
  delivery: {
    speed: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2" strokeLinecap="round"/>
        <path d="M16 4l2 2M6 4L4 6" strokeLinecap="round"/>
      </svg>
    ),
    price: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round"/>
      </svg>
    ),
    tracking: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="10" r="3"/>
        <path d="M12 2a8 8 0 00-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5c1.098-1.37 1.5-2.608 1.5-4.5a8 8 0 00-8-8z"/>
      </svg>
    )
  },
  rewards: {
    earn: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 8L8 12L12 16M16 8L12 12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    redeem: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    tier: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M5 3L12 7L19 3V7L12 11L5 7V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M5 11L12 15L19 11V15L12 19L5 15V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  tyla: {
    relief: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    safe: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    proven: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
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
    id: "rewards",
    title: "VivaBucks Rewards",
    subtitle: "EARN & SAVE",
    description: "Earn points on every purchase and unlock exclusive benefits.",
    background: "bg-[#002B49]",
    vectors: vectorGraphics.rewards,
    highlights: [
      {
        title: "Earn Points",
        description: "1 point per $1",
        vector: vectorGraphics.rewards.points,
        color: "from-accent-blue to-primary-light"
      },
      {
        title: "Multipliers",
        description: "Up to 2.25x Points",
        vector: vectorGraphics.rewards.multiplier,
        color: "from-accent-red to-accent-blue"
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
  const getBulletPoints = () => {
    switch (slide.id) {
      case 'delivery':
        return [
          {
            icon: bulletIcons.delivery.speed,
            title: "Fast Delivery",
            description: "1-hour, 3-hour, or same-day options"
          },
          {
            icon: bulletIcons.delivery.price,
            title: "Competitive Pricing",
            description: "Free delivery on routine orders"
          },
          {
            icon: bulletIcons.delivery.tracking,
            title: "Real-time Tracking",
            description: "Monitor your delivery status"
          }
        ];
      case 'rewards':
        return [
          {
            icon: bulletIcons.rewards.earn,
            title: "Earn Points",
            description: "Get 1 point per $1 spent"
          },
          {
            icon: bulletIcons.rewards.redeem,
            title: "Easy Redemption",
            description: "100 points = $1 off your purchase"
          },
          {
            icon: bulletIcons.rewards.tier,
            title: "Tier Benefits",
            description: "Unlock multipliers up to 5x points"
          }
        ];
      case 'tyla':
        return [
          {
            icon: bulletIcons.tyla.relief,
            title: "Fast Relief",
            description: "Works within minutes"
          },
          {
            icon: bulletIcons.tyla.safe,
            title: "Safe & Effective",
            description: "Clinically proven treatment"
          },
          {
            icon: bulletIcons.tyla.proven,
            title: "Doctor Recommended",
            description: "Trusted by healthcare professionals"
          }
        ];
      default:
        return [];
    }
  };

  if (slide.id === "rewards") {
    return (
      <div className="relative pt-2 sm:pt-6">
        {/* Main vector graphic */}
        <div className="w-full flex justify-center items-center mb-4 sm:mb-6">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center floating z-10">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg">
              <div className="w-full h-full">
                {slide.vectors.main}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-6 px-1.5 sm:px-4">
          {/* Left column - Earning & Redeeming */}
          <div className="border-r border-white/20 pr-1.5 sm:pr-4">
            <div className="space-y-1.5 sm:space-y-3">
              <div className="bg-gradient-to-br from-accent-blue to-primary-light p-2 sm:p-3 rounded-lg">
                <h3 className="text-white font-bold text-xs sm:text-sm">Earn VivaBucks</h3>
                <p className="text-white/80 text-[10px] sm:text-xs">10 points per $1 spent</p>
              </div>
              <div className="bg-gradient-to-br from-accent-red to-accent-blue p-2 sm:p-3 rounded-lg">
                <h3 className="text-white font-bold text-xs sm:text-sm">Redeem Rewards</h3>
                <p className="text-white/80 text-[10px] sm:text-xs">100 points = $1 off</p>
              </div>
            </div>
          </div>

          {/* Right column - Tier Benefits */}
          <div className="space-y-1.5 sm:space-y-2">
            {Object.entries(TIER_CONFIG).map(([tier, config], index) => (
              <div 
                key={tier}
                className="text-white flex items-center justify-between"
                style={{
                  opacity: 1 - (index * 0.1), // Fade out higher tiers slightly
                }}
              >
                <span className="font-bold text-[10px] sm:text-xs">{tier}</span>
                <span className="text-[10px] sm:text-xs text-white/90">
                  {config.multiplier}x Points
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const isTylaSlide = slide.id === "tyla";
  
  return (
    <div className="relative pt-2 sm:pt-6">
      {/* Main vector graphic - adjusted positioning and size */}
      <div className="w-full flex justify-center items-center mb-4 sm:mb-6">
        <div className="relative w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center floating z-10">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-md"></div>
          <div className="relative p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-full shadow-lg">
            {slide.vectors.main}
          </div>
        </div>
      </div>

      {/* Two-column layout with improved icon spacing */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6 px-2 sm:px-6">
        {/* Left column - Bullet points */}
        <div className="border-r border-white/20 pr-2 sm:pr-6">
          <ul className="space-y-2 sm:space-y-4 text-white">
            {getBulletPoints().map((point, index) => (
              <li key={index} className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  {point.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm leading-tight">
                    {point.title}
                  </h4>
                  <p className="text-white/80 text-[10px] sm:text-xs leading-tight mt-0.5">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column - Highlights with fixed icon sizes */}
        <div className="space-y-2 sm:space-y-4">
          {slide.highlights.map((highlight, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${highlight.color} p-2 sm:p-3 rounded-lg`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                  {highlight.vector}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-xs sm:text-sm leading-tight">
                    {highlight.title}
                  </h3>
                  <p className="text-white/80 text-[10px] sm:text-xs leading-tight mt-0.5">
                    {highlight.description}
                  </p>
                </div>
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
      <div 
        className="header-carousel-spacing w-full"
        style={{ 
          height: isMobile ? '8px' : '12px',
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
        style={{
          minHeight: isMobile ? '360px' : '400px',
          maxHeight: isMobile ? '420px' : 'none'
        }}
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