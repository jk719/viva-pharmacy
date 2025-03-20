'use client';

import { useEffect, useRef } from 'react';

export default function HeaderHeightAdjuster() {
  // Store previous heights to compare and only log when they change
  const prevHeightsRef = useRef({ navbarHeight: 0, loyaltyHeight: 0, totalHeight: 0 });
  const observerRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    const updateHeights = () => {
      const navbar = document.querySelector('.viva-navbar');
      const loyaltyBanner = document.querySelector('.loyalty-banner');
      
      if (!navbar || !loyaltyBanner) return;
      
      const navbarHeight = navbar.offsetHeight;
      const loyaltyHeight = loyaltyBanner.offsetHeight;
      const totalHeight = navbarHeight + loyaltyHeight;
      
      // Get previous heights
      const prevHeights = prevHeightsRef.current;
      
      // Only update CSS variables and log if heights have changed
      if (
        prevHeights.navbarHeight !== navbarHeight || 
        prevHeights.loyaltyHeight !== loyaltyHeight || 
        prevHeights.totalHeight !== totalHeight
      ) {
        // Update CSS variables
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
        document.documentElement.style.setProperty('--loyalty-banner-height', `${loyaltyHeight}px`);
        document.documentElement.style.setProperty('--total-header-height', `${totalHeight}px`);
        
        if (window.matchMedia('(min-width: 768px)').matches) {
          document.documentElement.style.setProperty('--navbar-height-md', `${navbarHeight}px`);
          document.documentElement.style.setProperty('--loyalty-banner-height-md', `${loyaltyHeight}px`);
          document.documentElement.style.setProperty('--total-header-height-md', `${totalHeight}px`);
        }
        
        // Only log when heights actually change
        console.log('Heights updated:', {
          navbarHeight,
          loyaltyHeight,
          totalHeight
        });
        
        // Update ref with new values
        prevHeightsRef.current = { navbarHeight, loyaltyHeight, totalHeight };
      }
    };
    
    // Debounced update function to prevent too many frequent updates
    const debouncedUpdate = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(updateHeights, 100);
    };
    
    // Run once on mount with a small delay
    setTimeout(updateHeights, 100); 
    
    // Update on resize - use debounced version
    window.addEventListener('resize', debouncedUpdate);
    
    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Add a MutationObserver with debouncing to prevent excessive updates
    const header = document.querySelector('header');
    if (header) {
      observerRef.current = new MutationObserver(debouncedUpdate);
      
      observerRef.current.observe(header, { 
        subtree: true, 
        childList: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    // Also check after images and resources are loaded
    window.addEventListener('load', updateHeights);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('load', updateHeights);
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
} 