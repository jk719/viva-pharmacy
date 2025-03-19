'use client';

import { useEffect } from 'react';

export default function HeaderHeightAdjuster() {
  useEffect(() => {
    const updateHeights = () => {
      const navbar = document.querySelector('.viva-navbar');
      const loyaltyBanner = document.querySelector('.loyalty-banner');
      
      if (!navbar || !loyaltyBanner) return;
      
      const navbarHeight = navbar.offsetHeight;
      const loyaltyHeight = loyaltyBanner.offsetHeight;
      const totalHeight = navbarHeight + loyaltyHeight;
      
      document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      document.documentElement.style.setProperty('--loyalty-banner-height', `${loyaltyHeight}px`);
      document.documentElement.style.setProperty('--total-header-height', `${totalHeight}px`);
      
      if (window.matchMedia('(min-width: 768px)').matches) {
        document.documentElement.style.setProperty('--navbar-height-md', `${navbarHeight}px`);
        document.documentElement.style.setProperty('--loyalty-banner-height-md', `${loyaltyHeight}px`);
        document.documentElement.style.setProperty('--total-header-height-md', `${totalHeight}px`);
      }
      
      console.log('Heights updated:', {
        navbarHeight,
        loyaltyHeight,
        totalHeight
      });
    };
    
    // Run once on mount
    setTimeout(updateHeights, 100); // Small delay to ensure DOM is ready
    
    // Update on resize
    window.addEventListener('resize', updateHeights);
    
    // Add a MutationObserver to watch for DOM changes in the header
    const header = document.querySelector('header');
    if (header) {
      const observer = new MutationObserver(() => {
        setTimeout(updateHeights, 50);
      });
      
      observer.observe(header, { 
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
      window.removeEventListener('resize', updateHeights);
      window.removeEventListener('load', updateHeights);
      
      if (header) {
        const observer = new MutationObserver(() => {});
        observer.disconnect();
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
} 