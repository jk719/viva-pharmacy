"use client";

import Image from 'next/image';
import { useState } from 'react';
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

  // If no src or error occurred, show fallback
  if (!src || error) {
    return (
      <Image
        src={FALLBACK_IMAGE}
        alt={alt || productName || "Product image"}
        className={`${className} object-contain`}
        {...props}
      />
    );
  }

  // Try to use the provided image URL
  return (
    <Image
      src={src}
      alt={alt || productName || "Product image"}
      onError={() => {
        console.log(`Failed to load image: ${src}`);
        setError(true);
      }}
      className={`${className} object-contain`}
      {...props}
    />
  );
} 