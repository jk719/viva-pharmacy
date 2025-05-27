'use client';

import { Suspense, useEffect } from 'react';
import HeaderHeightAdjuster from './HeaderHeightAdjuster';
import LoadingSpinner from './common/LoadingSpinner';
import setupLogger from '@/lib/logger';

export default function ClientLayout({ children }) {
  // Initialize enhanced logger
  useEffect(() => {
    setupLogger();
    
    // Add a debug button to the window
    const debugButton = document.createElement('button');
    debugButton.innerText = 'View Debug Logs';
    debugButton.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:9999;padding:5px 10px;background:#FF6B00;color:white;border:none;border-radius:5px;font-size:12px;';
    debugButton.onclick = () => window.viewLogs && window.viewLogs();
    document.body.appendChild(debugButton);
    
    return () => {
      document.body.removeChild(debugButton);
    };
  }, []);
  
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <HeaderHeightAdjuster />
      </Suspense>
      {children}
    </>
  );
} 