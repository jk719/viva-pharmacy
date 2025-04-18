"use client";

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { FALLBACK_IMAGE } from '@/lib/cloudinary';

/**
 * ProductImage - A resilient image component with fallback handling
 */
export default function ProductImage({ 
  src, 
  alt = "Product image", 
  className = "",
  productName,
  ...props 
}) {
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  // Image error handler with multiple fallback attempts
  const handleError = useCallback(() => {
    console.log(`Failed to load image (attempt ${attempt + 1}): ${currentSrc}`);
    
    // First attempt: Try to fix the URL if it's an Amazon URL
    if (attempt === 0 && src && src.includes('amazon')) {
      const secureUrl = src.replace('http://', 'https://');
      setCurrentSrc(secureUrl);
      setAttempt(1);
      return;
    }
    
    // All attempts failed, show fallback
    setError(true);
  }, [attempt, currentSrc, src]);

  // If no src or error occurred, show fallback
  if (!src || !currentSrc || error) {
    return (
      <Image
        src={FALLBACK_IMAGE}
        alt={alt || productName || "Product image"}
        className={`${className} object-contain`}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        {...props}
      />
    );
  }

  // Try to use the provided image URL
  return (
    <Image
      src={currentSrc}
      alt={alt || productName || "Product image"}
      onError={handleError}
      className={`${className} object-contain`}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
} 