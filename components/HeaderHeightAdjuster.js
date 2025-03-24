'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function HeaderHeightAdjuster() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateHeaderHeights = () => {
      const navbar = document.querySelector('.viva-navbar');
      const prescriptionBanner = document.querySelector('.prescription-banner');
      const loyaltyBanner = document.querySelector('.loyalty-banner');
      
      if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        const prescriptionHeight = prescriptionBanner?.offsetHeight || 0;
        const loyaltyHeight = isAuthenticated ? (loyaltyBanner?.offsetHeight || 0) : 0;
        
        const totalHeight = navbarHeight + prescriptionHeight + loyaltyHeight;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight + prescriptionHeight}px`);
        document.documentElement.style.setProperty('--navbar-height-md', `${navbarHeight + prescriptionHeight}px`);
        document.documentElement.style.setProperty('--total-header-height', `${totalHeight}px`);
        document.documentElement.style.setProperty('--total-header-height-md', `${totalHeight}px`);
      }
    };
    
    // Update on mount and window resize
    updateHeaderHeights();
    window.addEventListener('resize', updateHeaderHeights);
    
    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(updateHeaderHeights);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeights);
      observer.disconnect();
    };
  }, [isAuthenticated]);
  
  // This component doesn't render anything visible
  return null;
} 