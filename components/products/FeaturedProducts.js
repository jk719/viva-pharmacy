"use client";

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCategory } from '../../context/CategoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import useSWR from 'swr';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import toast from 'react-hot-toast';

// Extracted components for better organization
const ProductCard = ({ product, quantity, onAdd, onDecrement }) => {
  const [showIngredients, setShowIngredients] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-white rounded-2xl p-3 sm:p-4
                 min-w-[200px] max-w-[200px] 
                 sm:min-w-[280px] sm:max-w-[280px] 
                 scroll-snap-align-start border border-gray-100
                 shadow-sm hover:shadow-md transition-shadow duration-200
                 relative"
    >
      {product.isNew && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 z-20 bg-blue-500 text-white 
                   px-2 py-1 rounded-full text-xs font-medium"
        >
          New
        </motion.span>
      )}

      {product.stock === 0 && (
        <div className="absolute inset-0 bg-black/5 z-10 rounded-2xl
                      flex items-center justify-center">
          <span className="bg-red-500 text-white px-3 py-1.5 rounded-full
                       text-sm font-medium">
            Out of Stock
          </span>
        </div>
      )}

      <Link href={`/products/${product._id}`}>
        <div className="relative h-36 sm:h-48 w-full mb-3 sm:mb-4 
                      rounded-xl overflow-hidden group">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-contain p-2"
            sizes="(max-width: 640px) 200px, 280px"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 
                        group-hover:opacity-100 transition-opacity duration-200 
                        flex items-center justify-center">
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 
                         rounded-full text-xs sm:text-sm font-medium 
                         text-gray-700 shadow-sm transform translate-y-2 
                         group-hover:translate-y-0 transition-transform duration-200">
              View Details
            </span>
          </div>
          
          <CartButton 
            quantity={quantity} 
            onAdd={onAdd} 
            onDecrement={onDecrement}
            product={product}
            disabled={product.stock === 0}
          />
        </div>
      </Link>

      <ProductInfo product={product} />

      {product.activeIngredients?.length > 0 && (
        <div className="mt-3 text-sm">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="text-primary hover:text-primary-dark font-medium
                     flex items-center gap-1"
          >
            Active Ingredients
            <motion.span
              animate={{ rotate: showIngredients ? 180 : 0 }}
              className="text-lg"
            >
              ↓
            </motion.span>
          </button>
          
          <AnimatePresence>
            {showIngredients && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 text-gray-600"
              >
                {product.activeIngredients.map((ingredient, index) => (
                  <p key={index} className="text-xs">
                    • {ingredient.name}: {ingredient.amount}
                  </p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {product.dosageForm && (
        <span className="absolute bottom-2 right-2 text-xs
                      bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {product.dosageForm}
        </span>
      )}
    </motion.div>
  );
};

const CartButton = ({ quantity, onAdd, onDecrement, product, disabled }) => (
  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
    {quantity === 0 ? (
      <AddButton onAdd={() => onAdd(product)} disabled={disabled} />
    ) : (
      <QuantityControls 
        quantity={quantity}
        onDecrement={() => onDecrement(product._id)}
        onAdd={() => onAdd(product)}
        disabled={disabled}
      />
    )}
  </div>
);

const AddButton = ({ onAdd, disabled }) => (
  <motion.button
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      if (!disabled) onAdd();
    }}
    className={`flex items-center gap-1 
             px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm
             transition-colors duration-200
             ${disabled 
               ? 'bg-gray-300 cursor-not-allowed' 
               : 'bg-primary text-white hover:bg-primary/90'
             }`}
    disabled={disabled}
  >
    <IoMdAdd className="text-base sm:text-lg" />
    <span>{disabled ? 'Out of Stock' : 'Add'}</span>
  </motion.button>
);

const QuantityControls = ({ quantity, onDecrement, onAdd, disabled }) => (
  <div 
    onClick={(e) => e.preventDefault()}
    className="flex items-center gap-1 bg-white rounded-full 
             p-0.5 sm:p-1 border border-gray-100"
  >
    <QuantityButton onClick={onDecrement} color="red" icon={<HiMinusSm />} disabled={disabled} />
    <span className="w-4 sm:w-6 text-center font-medium text-xs sm:text-base">
      {quantity}
    </span>
    <QuantityButton onClick={onAdd} color="green" icon={<HiPlusSm />} disabled={disabled} />
  </div>
);

const QuantityButton = ({ onClick, color, icon, disabled }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      if (!disabled) onClick();
    }}
    className={`w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center 
              rounded-full text-${color}-500 hover:bg-${color}-50 
              transition-colors`}
    disabled={disabled}
  >
    {icon}
  </motion.button>
);

const ProductInfo = ({ product }) => (
  <div className="space-y-2 sm:space-y-3">
    <div className="space-y-1">
      <p className="text-base sm:text-lg font-bold text-primary">
        ${product.price.toFixed(2)}
      </p>
      <Link 
        href={`/products/${product._id}`}
        className="block text-gray-800 hover:text-primary 
                 transition-colors duration-200"
      >
        <h3 className="text-sm sm:text-base font-medium 
                     line-clamp-2 leading-snug">
          {product.name}
        </h3>
      </Link>
    </div>

    <p className="text-xs sm:text-sm text-gray-500 
                line-clamp-2 leading-relaxed">
      {product.description}
    </p>
  </div>
);

// Add the LoadingState component definition
const LoadingState = () => (
  <div className="py-6">
    <div className="animate-pulse space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-6 overflow-x-auto">
            {[1, 2, 3].map((j) => (
              <div key={j} className="min-w-[280px] space-y-3">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function FeaturedProducts() {
  const { addToCart, decrement, items = [] } = useCart();
  const { selectedCategory, setSelectedCategory } = useCategory();
  const { isRateLimited, handleRateLimit } = useRateLimit();
  
  // Initialize with "All" instead of null
  useEffect(() => {
    if (!selectedCategory) {
      setSelectedCategory("All");
    }
  }, [selectedCategory, setSelectedCategory]);

  // 1. Define all hooks first
  const getItemQuantity = useCallback((productId) => {
    const item = items?.find((item) => item?.id === productId);
    return item ? item.quantity : 0;
  }, [items]);

  const handleAddToCart = useCallback((product) => {
    console.log('Adding to cart:', product);
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }, [addToCart]);

  const handleDecrement = useCallback((productId) => {
    decrement(productId);
  }, [decrement]);

  // Updated SWR hook with rate limit handling
  const { data, error, isLoading } = useSWR(
    '/api/products',
    async (url) => {
      console.log('SWR: Starting fetch');
      try {
        const response = await fetch(url);
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60;
          const error = new Error('Rate limit exceeded');
          error.retryAfter = parseInt(retryAfter);
          error.isRateLimit = true;
          throw error;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
        }
        
        const jsonData = await response.json();
        console.log('SWR: Fetch successful', {
          success: jsonData.success,
          productCount: jsonData.products?.length,
          categories: [...new Set(jsonData.products?.map(p => p.category) || [])]
        });
        return jsonData;
      } catch (err) {
        console.error('SWR: Fetch failed', err);
        throw err;
      }
    },
    {
      fallbackData: { success: false, products: [] },
      suspense: false,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onError: (err) => {
        console.error('SWR Error:', err);
        if (err.isRateLimit) {
          handleRateLimit(err, () => {
            // This will be called after the rate limit period
            window.location.reload();
          });
        }
      }
    }
  );

  const products = data?.products || [];

  // Update categories effect
  useEffect(() => {
    if (products.length > 0) {
      const availableCategories = ["All", ...new Set(products.map(p => p.category))];
      console.log('Available categories:', availableCategories);
      
      // If current category is not available, reset to "All"
      if (!availableCategories.includes(selectedCategory)) {
        setSelectedCategory("All");
      }
    }
  }, [products, selectedCategory, setSelectedCategory]);

  // Debug logging
  console.log('FeaturedProducts: Render State', {
    isLoading,
    hasError: !!error,
    productsCount: products.length,
    selectedCategory,
    categories: products.length > 0 ? [...new Set(products.map(p => p.category))] : []
  });

  // Updated render logic with rate limit handling
  if (isRateLimited) {
    return (
      <div className="py-6 text-center">
        <div className="text-amber-600 mb-4">
          Too many requests. Please wait a moment before trying again.
        </div>
        <div className="text-sm text-gray-500">
          The page will automatically refresh when ready.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (error) {
    // Don't show error state for rate limits as we handle it above
    if (!error.isRateLimit) {
      return (
        <div className="py-6 text-center">
          <div className="text-red-500 mb-4">
            Error loading products. Please try again.
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      );
    }
    return null;
  }

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  // Update the filtering logic in CategorySection
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories = selectedCategory === 'All'
    ? [...new Set(products.map(p => p.category))]
        .map(cat => ({
          name: cat,
          count: products.filter(p => p.category === cat).length
        }))
    : [{
        name: selectedCategory,
        count: filteredProducts.length
      }];

  return (
    <section className="py-4 sm:py-6">
      {categories.map((category) => (
        <CategorySection 
          key={category.name}
          category={category}
          products={filteredProducts.filter(p => 
            selectedCategory === 'All' ? p.category === category.name : true
          )}
          getItemQuantity={getItemQuantity}
          onAddToCart={handleAddToCart}
          onDecrement={handleDecrement}
        />
      ))}
    </section>
  );
}

const EmptyState = () => (
  <div className="py-6 text-center text-gray-500">
    No products found in this category.
  </div>
);

const CategorySection = ({ 
  category, 
  products, 
  getItemQuantity, 
  onAddToCart, 
  onDecrement 
}) => {
  // Get the tagline from the first product in the category
  const categoryTagline = products[0]?.categoryTagline;

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col mb-4 sm:mb-6 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-primary relative">
          {category.name}
          <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
        </h2>
        {categoryTagline && (
          <p className="mt-2 text-sm text-gray-600 italic">
            {categoryTagline}
          </p>
        )}
        <span className="text-xs sm:text-sm text-gray-500 mt-1">
          {category.count} items
        </span>
      </div>

      <div className="flex overflow-x-auto gap-4 sm:gap-6 
                    scroll-snap-x px-2 pb-4 -mx-2
                    scrollbar-thin scrollbar-thumb-gray-300 
                    scrollbar-track-transparent">
        {products
          .filter((product) => product.category === category.name)
          .map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              quantity={getItemQuantity(product._id)}
              onAdd={onAddToCart}
              onDecrement={onDecrement}
            />
          ))}
      </div>
    </div>
  );
};