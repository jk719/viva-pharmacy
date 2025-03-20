"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function HeaderSpacer() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  
  useEffect(() => {
    // Make the header spacer use the correct height based on authentication status
    if (typeof window !== 'undefined') {
      const spacer = document.querySelector('.header-spacer');
      if (spacer) {
        // For non-authenticated users, only account for the navbar
        if (!isAuthenticated) {
          spacer.style.height = 'var(--navbar-height)';
          
          // For desktop
          const mediaQuery = window.matchMedia('(min-width: 768px)');
          if (mediaQuery.matches) {
            spacer.style.height = 'var(--navbar-height-md)';
          }
          
          // Listen for media query changes
          const handleMediaChange = (e) => {
            spacer.style.height = e.matches ? 
              'var(--navbar-height-md)' : 
              'var(--navbar-height)';
          };
          
          mediaQuery.addEventListener('change', handleMediaChange);
          return () => mediaQuery.removeEventListener('change', handleMediaChange);
        }
      }
    }
  }, [isAuthenticated]);
  
  // Use the total header height from CSS variables
  return (
    <div 
      className="header-spacer w-full"
      style={{ 
        height: isAuthenticated ? 
          'var(--total-header-height)' : 
          'var(--navbar-height)'
      }}
      aria-hidden="true"
    />
  );
} 