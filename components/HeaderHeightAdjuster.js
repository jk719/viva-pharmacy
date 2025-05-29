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
        
        // Update CSS variables with proper calculations
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
        document.documentElement.style.setProperty('--navbar-height-md', `${navbarHeight}px`);
        document.documentElement.style.setProperty('--prescription-banner-height', `${prescriptionHeight}px`);
        document.documentElement.style.setProperty('--prescription-banner-height-md', `${prescriptionHeight}px`);
        document.documentElement.style.setProperty('--loyalty-banner-height', `${loyaltyHeight}px`);
        document.documentElement.style.setProperty('--loyalty-banner-height-md', `${loyaltyHeight}px`);
        document.documentElement.style.setProperty('--total-header-height', `${totalHeight}px`);
        document.documentElement.style.setProperty('--total-header-height-md', `${totalHeight}px`);
        
        console.log('Header heights updated:', {
          navbar: navbarHeight,
          prescription: prescriptionHeight,
          loyalty: loyaltyHeight,
          total: totalHeight,
          authenticated: isAuthenticated
        });
      }
    };
    
    // Update immediately and on changes
    updateHeaderHeights();
    
    // Update on window resize
    const handleResize = () => {
      setTimeout(updateHeaderHeights, 100); // Small delay to ensure layout is complete
    };
    window.addEventListener('resize', handleResize);
    
    // Use MutationObserver to detect DOM changes in header
    const observer = new MutationObserver((mutations) => {
      const headerMutation = mutations.some(mutation => 
        mutation.target.closest?.('header') || 
        mutation.target.classList?.contains('loyalty-banner') ||
        mutation.target.classList?.contains('prescription-banner') ||
        mutation.target.classList?.contains('viva-navbar')
      );
      
      if (headerMutation) {
        setTimeout(updateHeaderHeights, 50); // Small delay to ensure DOM is settled
      }
    });
    
    // Observe changes to the entire header
    const header = document.querySelector('header');
    if (header) {
      observer.observe(header, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
    
    // Also observe body for dynamic header changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [isAuthenticated]);
  
  // This component doesn't render anything visible
  return null;
} 