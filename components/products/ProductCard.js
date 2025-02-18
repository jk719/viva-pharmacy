"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { getCloudinaryUrl, FALLBACK_IMAGE } from '@/lib/cloudinary';
import { HiMinus, HiPlus } from 'react-icons/hi';
import { debounce } from 'lodash';

const ProductCard = memo(({ product }) => {
  const { addToCart, updateItemQuantity, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addButtonRef = useRef(null);

  // Memoize cartItem lookup
  const cartItem = items.find(item => item.productId === product._id);
  const quantity = cartItem?.quantity || 0;

  // Debounced add to cart function
  const debouncedAddToCart = useCallback(
    debounce(async (product) => {
      try {
        await addToCart(product);
      } finally {
        setIsAdding(false);
      }
    }, 300),
    [addToCart]
  );

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    setIsAdding(true);
    
    console.log('Adding to cart:', product.name);
    debouncedAddToCart(product);
  }, [product, debouncedAddToCart, isAdding]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedAddToCart.cancel();
    };
  }, [debouncedAddToCart]);

  const imageUrl = !imageError ? (
    product.imageUrl || 
    (product.cloudinaryPublicId ? getCloudinaryUrl(product.cloudinaryPublicId) : FALLBACK_IMAGE)
  ) : FALLBACK_IMAGE;

  // Move QuantityControls outside of the main component
  const QuantityControls = memo(() => (
    <div className="absolute top-2 right-2 z-20" onClick={e => e.stopPropagation()}>
      {quantity === 0 ? (
        <button 
          ref={addButtonRef}
          onClick={handleAddToCart}
          className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors duration-200"
          disabled={!product.isInStock || isAdding}
        >
          <HiPlus className="w-5 h-5" /> Add
        </button>
      ) : (
        <div className="flex items-center bg-white rounded-lg shadow-md">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (quantity > 0) {
                updateItemQuantity(product._id, quantity - 1);
              }
            }}
            className="p-2 text-red-500 hover:bg-red-50"
          >
            <HiMinus className="w-5 h-5" />
          </button>
          <span className="px-3 font-medium">{quantity}</span>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateItemQuantity(product._id, quantity + 1);
            }}
            className="p-2 text-green-500 hover:bg-green-50"
          >
            <HiPlus className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  ));

  QuantityControls.displayName = 'QuantityControls';

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
        <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative w-full h-48 mb-4">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority={true}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          </div>
          
          <div className="mt-2">
            <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{product.categoryPath}</p>
            <span className="text-lg font-bold mt-2 block">${product.price.toFixed(2)}</span>
            {product.activeIngredients?.length > 0 && (
              <div className="text-sm text-gray-600">
                <p className="font-medium">Active Ingredients:</p>
                <ul className="list-disc list-inside">
                  {product.activeIngredients.slice(0, 2).map((ingredient, index) => (
                    <li key={`${product._id}-ingredient-${index}`} className="truncate">
                      {ingredient.name}: {ingredient.amount}
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
      <QuantityControls key={`controls-${product._id}`} />
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 