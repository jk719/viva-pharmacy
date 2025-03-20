"use client";

import { useEffect } from 'react';

export default function HeaderSpacer() {
  useEffect(() => {
    // Fix for mobile space issue by directly adjusting CSS variables
    const fixMobileSpacing = () => {
      // Check if we're on mobile
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Reduce the loyalty banner height to fix spacing
        document.documentElement.style.setProperty('--loyalty-banner-height', '60px');
        
        // Recalculate total header height
        const navbarHeight = parseFloat(getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height').trim());
        const loyaltyHeight = 60; // Our new fixed height
        
        document.documentElement.style.setProperty(
          '--total-header-height', 
          `${navbarHeight + loyaltyHeight}px`
        );
      }
    };

    // Run immediately
    fixMobileSpacing();
    
    // Also run on resize
    window.addEventListener('resize', fixMobileSpacing);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', fixMobileSpacing);
    };
  }, []);

  return null; // This component doesn't render anything
} 