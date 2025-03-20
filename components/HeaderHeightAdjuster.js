'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function HeaderHeightAdjuster() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Function to update CSS variables for header heights
    const updateHeaderHeights = () => {
      // Get the actual navbar height
      const navbar = document.querySelector('.viva-navbar');
      if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        
        // Update navbar height variables
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
        document.documentElement.style.setProperty('--navbar-height-md', `${navbarHeight}px`);
      }
      
      // For authenticated users, check loyalty banner height
      if (isAuthenticated) {
        const loyaltyBanner = document.querySelector('.loyalty-banner');
        if (loyaltyBanner) {
          // Default to these values if we can't measure
          let mobileHeight = 75;
          let desktopHeight = 100;
          
          // Try to get the actual height
          if (loyaltyBanner.offsetHeight > 0) {
            const bannerHeight = loyaltyBanner.offsetHeight;
            
            // Set the same height for both mobile and desktop
            // The component's internal styles will handle responsiveness
            mobileHeight = desktopHeight = bannerHeight;
          }
          
          // Update loyalty banner height variables
          document.documentElement.style.setProperty('--loyalty-banner-height', `${mobileHeight}px`);
          document.documentElement.style.setProperty('--loyalty-banner-height-md', `${desktopHeight}px`);
        } else {
          // No loyalty banner found, set to 0
          document.documentElement.style.setProperty('--loyalty-banner-height', '0px');
          document.documentElement.style.setProperty('--loyalty-banner-height-md', '0px');
        }
      } else {
        // Not authenticated, no loyalty banner
        document.documentElement.style.setProperty('--loyalty-banner-height', '0px');
        document.documentElement.style.setProperty('--loyalty-banner-height-md', '0px');
      }
      
      // Update total header height variables
      const computedStyle = getComputedStyle(document.documentElement);
      const navbarHeight = computedStyle.getPropertyValue('--navbar-height').trim();
      const navbarHeightMd = computedStyle.getPropertyValue('--navbar-height-md').trim();
      const loyaltyHeight = computedStyle.getPropertyValue('--loyalty-banner-height').trim();
      const loyaltyHeightMd = computedStyle.getPropertyValue('--loyalty-banner-height-md').trim();
      
      document.documentElement.style.setProperty('--total-header-height', `calc(${navbarHeight} + ${loyaltyHeight})`);
      document.documentElement.style.setProperty('--total-header-height-md', `calc(${navbarHeightMd} + ${loyaltyHeightMd})`);
    };
    
    // Update on initial load
    updateHeaderHeights();
    
    // Update on window resize
    window.addEventListener('resize', updateHeaderHeights);
    
    // Update after components have had time to render
    const timer = setTimeout(updateHeaderHeights, 300);
    
    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(() => {
      // Only run after a small delay to avoid excessive updates
      setTimeout(updateHeaderHeights, 50);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeights);
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isAuthenticated]);
  
  // This component doesn't render anything visible
  return null;
} 