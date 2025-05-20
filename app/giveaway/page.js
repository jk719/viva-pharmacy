'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  FaGift, FaTv, FaCheckCircle, FaEnvelope, FaMobile, 
  FaMapMarkerAlt, FaStar, FaGamepad, FaFilm, FaWifi, 
  FaMicrophone, FaBolt, FaCheck, FaAward, FaHeart
} from 'react-icons/fa';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Image from 'next/image';

// TV specs with actual React icons, grouped by category
const tvSpecs = [
  { 
    category: 'Display',
    items: [
      { icon: <FaTv className="text-blue-500"/>, text: "55\" 4K Ultra HD Display" },
      { icon: <FaBolt className="text-amber-500"/>, text: "HDR10 & Dolby Vision" }
    ]
  },
  { 
    category: 'Audio',
    items: [
      { icon: <FaStar className="text-purple-500"/>, text: "Dolby Atmos Sound" },
      { icon: <FaMicrophone className="text-red-500"/>, text: "Voice Control" }
    ]
  },
  { 
    category: 'Smart Features',
    items: [
      { icon: <FaWifi className="text-green-500"/>, text: "Smart Home Compatible" },
      { icon: <FaFilm className="text-blue-600"/>, text: "All Streaming Apps" },
      { icon: <FaGamepad className="text-indigo-500"/>, text: "Gaming Mode" }
    ]
  }
];

// Carousel images
const tvImages = [
  { src: "/images/giveaway/fire-tv-1.jpg", alt: "Smart TV Front View", caption: "Sleek Design" },
  { src: "/images/giveaway/fire-tv-2.jpg", alt: "Smart TV Side View", caption: "Ultra-Thin Profile" },
  { src: "/images/giveaway/fire-tv-3.jpg", alt: "Smart TV Interface", caption: "Intuitive Interface" },
  { src: "/images/giveaway/fire-tv-4.jpg", alt: "Smart TV Remote", caption: "Voice Remote" },
  { src: "/images/giveaway/fire-tv-5.jpg", alt: "Smart TV Features", caption: "Smart Features" }
];


// Launch benefits
const launchBenefits = [
  { icon: <FaBolt className="text-blue-500"/>, text: "Early access to exclusive deals" },
  { icon: <FaStar className="text-amber-500"/>, text: "Double VivaBucks on first purchase" },
  { icon: <FaGift className="text-purple-500"/>, text: "Special launch promotions" }
];

export default function GiveawayPage() {
  const [timeLeft, setTimeLeft] = useState({});
  const router = useRouter();
  
  // Countdown timer effect
  useEffect(() => {
    // Giveaway end date - Memorial Day 2025 (May 26th at 5pm)
    const endDate = new Date('2025-05-26T17:00:00');
    
    const calculateTimeLeft = () => {
      const difference = endDate - new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    };

    // Update time initially
    setTimeLeft(calculateTimeLeft());
    
    // Set up interval to update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  // Handle redirect to registration page
  const handleRegisterClick = () => {
    router.push('/register?referrer=giveaway');
  };
  
  // Helper components
  const CountdownUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-lg font-mono font-bold rounded-md w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
        {value}
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
  
  const TVFeatureCard = ({ category, items }) => (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-sm p-2.5 md:p-4 h-full border border-gray-100">
      <h3 className="text-sm md:text-lg font-medium text-primary mb-1.5 md:mb-3 flex items-center">
        {category === 'Display' && <FaTv className="mr-1.5 text-primary-light" />}
        {category === 'Audio' && <FaMicrophone className="mr-1.5 text-primary-light" />}
        {category === 'Smart Features' && <FaWifi className="mr-1.5 text-primary-light" />}
        {category}
      </h3>
      <div className="space-y-1.5 md:space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center p-1.5 md:p-2 bg-gray-50/80 rounded-md hover:bg-primary-light/10 transition-colors border-l-2 border-l-primary-light/30">
            <div className="mr-2 md:mr-3 text-base md:text-xl">{item.icon}</div>
            <div className="text-xs md:text-sm text-gray-700 font-medium">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const AccountBenefits = () => (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-5 border border-gray-100">
      <h3 className="text-base md:text-lg font-semibold text-center mb-2">Join Our Launch Celebration</h3>
      
      {/* Combined Benefits */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {/* Benefits List - Combined in a single section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-2.5 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center bg-white/70 px-2 py-1.5 rounded-md">
              <FaGift className="text-primary-light mr-1" />
              <span className="text-xs font-medium">100 VivaBucks</span>
            </div>
            <div className="flex items-center bg-white/70 px-2 py-1.5 rounded-md">
              <FaStar className="text-amber-500 mr-1" />
              <span className="text-xs font-medium">Double Rewards</span>
            </div>
            <div className="flex items-center bg-white/70 px-2 py-1.5 rounded-md">
              <FaBolt className="text-blue-500 mr-1" />
              <span className="text-xs font-medium">Early Access</span>
            </div>
            <div className="flex items-center bg-white/70 px-2 py-1.5 rounded-md">
              <FaHeart className="text-red-500 mr-1" />
              <span className="text-xs font-medium">Free Delivery</span>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleRegisterClick}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-3 rounded-md transition duration-300 flex items-center justify-center text-sm"
      >
        Create Account & Enter Giveaway
        <FaGift className="ml-2" />
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Already have an account? You're automatically entered!
      </p>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-blue-50 to-gray-50 py-3 md:py-6 pt-[calc(var(--navbar-height)+16px)] md:pt-[calc(var(--navbar-height-md)+var(--loyalty-banner-height-md)+1rem)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        
        {/* Header with Countdown */}
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-2 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm">
            <FaGift className="mr-1 text-xs md:text-sm" /> Website Launch Celebration
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-1 md:mb-2">
            Win a 55" 4K Smart TV!
          </h1>
          <h2 className="text-base md:text-xl font-medium text-gray-800 mb-1 md:mb-2">
            Celebrating the Launch of <span className="font-bold text-blue-600">GoViVaNova.com</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs md:text-base">
            Join our celebration by creating a free account and be automatically entered to win! Open to residents in the Jackson Heights area.
          </p>
          
          {/* Countdown timer */}
          {Object.keys(timeLeft).length > 0 && (
            <div className="mt-2 md:mt-4">
              <p className="text-xs text-gray-500 mb-1 md:mb-2">Giveaway Ends In:</p>
              <div className="flex justify-center space-x-2 md:space-x-3">
                <CountdownUnit value={timeLeft.days} label="Days" />
                <CountdownUnit value={timeLeft.hours} label="Hours" />
                <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                <CountdownUnit value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="md:flex md:space-x-4">
          {/* Left Column (TV Carousel and Features) */}
          <div className="md:w-3/5 mb-3 md:mb-0">
            {/* TV Carousel */}
            <div className="rounded-lg shadow-md overflow-hidden mb-3 md:mb-6">
              <Carousel 
                autoPlay 
                infiniteLoop 
                showStatus={false} 
                showThumbs={false} 
                showIndicators={false}
                interval={5000}
                className="tv-carousel"
                renderIndicator={() => null}
              >
                {tvImages.map((image, idx) => (
                  <div key={idx} className="carousel-item-container">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={500}
                      height={300}
                      className="w-full h-auto" 
                      priority={idx === 0}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
            
            {/* Compact TV Feature Categories for Mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6">
              {tvSpecs.map((category, idx) => (
                <TVFeatureCard key={idx} {...category} />
              ))}
            </div>
          </div>
          
          {/* Right Column (Account Creation CTA) */}
          <div className="md:w-2/5">
            {/* Account Benefits */}
            <AccountBenefits />
            
            {/* Rules Section - Compact for Mobile */}
            <div className="mt-2 md:mt-4 p-2 md:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm md:text-md font-semibold mb-1 md:mb-2 flex items-center">
                <FaCheckCircle className="text-blue-500 mr-1 md:mr-2" /> Giveaway Rules
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-2">
                <ul className="text-xs md:text-sm text-gray-600 space-y-0 md:space-y-1 list-disc pl-4 md:pl-5">
                  <li>Must be 18+ years old</li>
                  <li>One entry per person</li>
                  <li>Local residents only</li>
                </ul>
                <ul className="text-xs md:text-sm text-gray-600 space-y-0 md:space-y-1 list-disc pl-4 md:pl-5">
                  <li>No purchase needed</li>
                  <li>Drawing: Memorial Day, May 26th at 5pm</li>
                  <li>Employees not eligible</li>
                </ul>
              </div>
              <div className="mt-1 md:mt-3 text-xs text-gray-500 border-t border-gray-100 pt-1 md:pt-2">
                This giveaway celebrates the official launch of <span className="font-semibold">GoViVaNova.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Carousel Styling */}
      <style jsx>{`
        /* Legend styles removed */
        
        .tv-carousel .carousel .slide {
          background: transparent !important;
        }
        
        .carousel-item-container {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          overflow: visible;
          aspect-ratio: 16 / 9;
        }
        
        @media (min-width: 768px) {
          .carousel-item-container {
            aspect-ratio: 16 / 9;
            max-height: 350px;
          }
        }
        
        /* Hide control dots completely */
        .tv-carousel .control-dots {
          display: none !important;
        }
        
        .tv-carousel .control-arrow {
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          margin: 0 16px;
          padding: 15px;
          opacity: 0.8;
          z-index: 2;
        }
        
        /* Benefits responsive styling */
        @media (max-width: 640px) {
          :global(.grid.grid-cols-2.gap-2) {
            /* Already a grid with 2 columns, just adjust the gap for mobile */
            gap: 0.5rem !important;
          }
          
          :global(.flex.items-center.bg-white\/70) {
            width: 100% !important;
            justify-content: center !important;
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
