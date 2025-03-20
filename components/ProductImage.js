"use client";

import Image from 'next/image';
import { useState } from 'react';
import { getPossibleImageUrls, FALLBACK_IMAGE } from '@/lib/cloudinary';

/**
 * ProductImage - A resilient image component with fallback handling
 */
export default function ProductImage({ 
  src, 
  alt = "Product image", 
  productName,
  ...props 
}) {
  const [urlIndex, setUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // Get all possible URLs to try
  const possibleUrls = productName ? 
    getPossibleImageUrls(productName) : 
    [src, FALLBACK_IMAGE];
  
  // If we've gone through all URLs or have a definite error, show fallback
  if (urlIndex >= possibleUrls.length || (urlIndex > 0 && !possibleUrls[urlIndex])) {
    return (
      <Image
        src={FALLBACK_IMAGE}
        alt={alt}
        {...props}
      />
    );
  }

  return (
    <Image
      src={urlIndex === 0 && src ? src : possibleUrls[urlIndex]}
      alt={alt}
      onError={() => {
        console.error(`Image error at index ${urlIndex} for ${productName || 'unknown product'}`);
        // Try next URL in the list
        setUrlIndex(prev => prev + 1);
      }}
      {...props}
    />
  );
} 