'use client';

import { useEffect, useRef } from 'react';

export default function useHeaderHeight() {
  const navbarRef = useRef(null);
  const loyaltyBannerRef = useRef(null);
  
  useEffect(() => {
    if (!navbarRef.current || !loyaltyBannerRef.current) return;
    
    const updateHeights = () => {
      const navbarHeight = navbarRef.current.offsetHeight;
      const loyaltyHeight = loyaltyBannerRef.current.offsetHeight;
      const totalHeight = navbarHeight + loyaltyHeight;
      
      document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      document.documentElement.style.setProperty('--loyalty-banner-height', `${loyaltyHeight}px`);
      document.documentElement.style.setProperty('--total-header-height', `${totalHeight}px`);
    };
    
    // Update on mount and window resize
    updateHeights();
    window.addEventListener('resize', updateHeights);
    
    return () => window.removeEventListener('resize', updateHeights);
  }, []);
  
  return { navbarRef, loyaltyBannerRef };
} 