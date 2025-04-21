"use client";

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { FALLBACK_IMAGE, getCloudinaryUrl } from '@/lib/cloudinary';
import { HiMinus, HiPlus } from 'react-icons/hi';
import { debounce } from 'lodash';
import QuantityControls from '@/components/common/QuantityControls';
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics/events';
import { motion } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import toast from 'react-hot-toast';

const ProductCard = memo(({ product }) => {
  const { addToCart, updateItemQuantity, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const addButtonRef = useRef(null);
  const [imageAttempts, setImageAttempts] = useState(0);
  const MAX_IMAGE_ATTEMPTS = 3;

  // Memoize cartItem lookup
  const cartItem = items.find(item => item.productId === product._id);
  const quantity = cartItem?.quantity || 0;

  // Handle image error with improved fallback strategy
  const handleImageError = useCallback(() => {
    console.error('Image loading failed:', {
      url: currentImageUrl,
      productId: product._id,
      productName: product.name,
      attempts: imageAttempts
    });
    
    // Track the attempt number
    const attemptNumber = imageAttempts + 1;
    setImageAttempts(attemptNumber);
    
    // Different fallback strategies based on attempt number
    if (attemptNumber === 1 && product.imageUrl) {
      // First try: Use direct image URL without transformations
      setCurrentImageUrl(product.imageUrl);
    } else if (attemptNumber === 2 && product.imageUrl && product.imageUrl.includes('amazon')) {
      // Second try for Amazon images: Try with more permissive options
      setCurrentImageUrl(product.imageUrl.replace('http://', 'https://'));
    } else {
      // Final fallback: Use local placeholder
      setImageError(true);
      setCurrentImageUrl(FALLBACK_IMAGE);
    }
  }, [currentImageUrl, imageAttempts, product]);

  // Get initial image URL
  useEffect(() => {
    if (product) {
      const url = getCloudinaryUrl(product);
      setCurrentImageUrl(url);
      setImageError(false);
      setImageAttempts(0); // Reset attempts when product changes
    }
  }, [product]);

  // Debounced add to cart function
  const debouncedAddToCart = useCallback(
    debounce(async (product) => {
      try {
        await addToCart(product);
        trackAddToCart(product, 1);
      } finally {
        setIsAdding(false);
      }
    }, 300),
    [addToCart]
  );

  const handleAddToCart = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isAdding) return;
    setIsAdding(true);
    
    addToCart(product);
    trackAddToCart(product, 1);
    
    // Reset loading state after a short delay for UX
    setTimeout(() => setIsAdding(false), 300);
  }, [product, addToCart, isAdding]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedAddToCart.cancel();
    };
  }, [debouncedAddToCart]);

  const handleRemoveFromCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) {
      updateItemQuantity(product._id, quantity - 1);
      trackRemoveFromCart(product, 1);
    }
  }, [product, quantity, updateItemQuantity]);

  const imageUrl = useMemo(() => {
    if (imageError) {
      return FALLBACK_IMAGE;
    }
    return currentImageUrl || FALLBACK_IMAGE;
  }, [currentImageUrl, imageError]);

  // Determine if this is an external image (like Amazon)
  const isExternalImage = useMemo(() => {
    return imageUrl && !imageUrl.includes('cloudinary.com') && !imageUrl.startsWith('/') && 
      (imageUrl.includes('amazon') || imageUrl.includes('media-amazon'));
  }, [imageUrl]);

  return (
    <div className="relative group bg-white">
      {product.isNew && (
        <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs z-10">
          New
        </span>
      )}
      {!product.isInStock && (
        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs z-10">
          Out of Stock
        </span>
      )}
      <Link href={`/products/${product._id}`}>
        <div className="p-2 sm:p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative w-full h-32 sm:h-48 mb-2 sm:mb-4 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={product.name}
              className="object-contain w-full h-full max-w-full max-h-full"
              onError={handleImageError}
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="mt-1 sm:mt-2">
            <h3 className="text-sm sm:text-lg font-semibold line-clamp-2">{product.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{product.categoryPath || product.category}</p>
            <span className="text-base sm:text-lg font-bold mt-1 sm:mt-2 block">${product.price.toFixed(2)}</span>
            {product.activeIngredients?.length > 0 && (
              <div className="text-sm text-gray-600">
                <p className="font-medium">Active Ingredients:</p>
                <ul className="list-disc list-inside">
                  {product.activeIngredients.slice(0, 2).map((ingredient, index) => (
                    <li key={`${product._id}-ingredient-${index}`} className="truncate">
                      {typeof ingredient === 'string' ? ingredient : `${ingredient.name}${ingredient.amount ? `: ${ingredient.amount}` : ''}`}
                    </li>
                  ))}
                  {product.activeIngredients.length > 2 && (
                    <li key={`${product._id}-more`} className="text-primary cursor-pointer">
                      + more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Link>
      <QuantityControls
        quantity={quantity}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        isInStock={product.isInStock}
        isLoading={isAdding}
        variant="card"
        size="small"
        className="absolute top-2 right-2 z-20"
      />
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 