"use client";

import { useCallback, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import useSWR from 'swr';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import toast from 'react-hot-toast';
import { categories } from '../../data/categories';
import { FaPills, FaSprayCan, FaThermometerHalf, FaHeadSideCough } from 'react-icons/fa';

// Add this icon mapping object at the top of your file
const CATEGORY_ICONS = {
  'oral-pain-relief': FaPills,
  'topical-pain-relief': FaSprayCan,
  'fever-reducers': FaThermometerHalf,
  'migraine-relief': FaHeadSideCough,
  // Add more mappings as needed
};

// Add this helper function at the top of the file, after the imports
const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

// Extracted components for better organization
const ProductCard = ({ product, quantity, onAdd, onDecrement }) => {
  const [showIngredients, setShowIngredients] = useState(false);

  // Add fallback image handling
  const imageUrl = product.image || '/images/placeholder.png'; // Add a placeholder image to your public folder
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-3 sm:p-4
                 h-full
                 border border-gray-100
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
            src={imageUrl}
            alt={product.name}
            fill
            priority
            className="object-contain p-2"
            sizes="(max-width: 640px) 200px, 280px"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder.png';
            }}
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

// Update the SubcategoryGrid component
const SubcategoryGrid = ({ category }) => {
  if (!category || !category.items) return null;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {category.items.map((item) => {
        const IconComponent = CATEGORY_ICONS[item.slug] || FaPills;
        
        return (
          <Link 
            key={item.slug} 
            href={`/categories/${category.slug}/${item.slug}`}
            className="flex flex-col items-center p-4 bg-white rounded-lg 
                     border border-gray-100 hover:border-gray-200 
                     transition-colors duration-200"
          >
            <div className="w-16 h-16 flex items-center justify-center 
                          text-gray-600 mb-3">
              <IconComponent className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-medium text-center text-gray-900">
              {item.name}
            </h3>
            <span className="mt-1 text-xs text-gray-500">
              View Products
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default function FeaturedProducts({ categoryFilter }) {
  const { addToCart, decrement, items = [] } = useCart();
  const { isRateLimited, handleRateLimit } = useRateLimit();
  
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

  // Add this near the top of your file to see all category mappings
  useEffect(() => {
    if (products.length > 0) {
      console.log('Category Mapping:', {
        'Database Categories': [...new Set(products.map(p => p.category))],
        'Frontend Categories': categories.map(c => ({
          slug: c.slug,
          name: c.name,
          items: c.items?.map(i => i.name)
        }))
      });
    }
  }, [products]);

  // Filter products based on categoryFilter prop
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    if (!categoryFilter || categoryFilter === 'all') return products;
    
    // Find the category object that matches the slug
    const category = categories.find(cat => cat.slug === categoryFilter);
    if (!category) {
      console.log('Category not found:', categoryFilter);
      return [];
    }

    // Helper function to normalize strings for comparison
    const normalizeString = (str) => str
      ?.toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

    console.log('Filtering Categories:', {
      categorySlug: categoryFilter,
      categoryName: category.name,
      validItems: category.items.map(item => item.name),
      productsBeforeFilter: products.length
    });

    return products.filter(product => {
      const normalizedProductCategory = normalizeString(product.category);
      const normalizedProductItem = normalizeString(product.item || '');
      
      console.log('Product Match:', {
        name: product.name,
        category: normalizedProductCategory,
        item: normalizedProductItem,
        isMatch: false,
        validItems: category.items.map(item => item.name)
      });

      // Check for category match
      if (normalizedProductCategory === normalizeString(category.name)) {
        return true;
      }

      // Check for item match
      const itemMatches = category.items.some(item => 
        normalizedProductItem === normalizeString(item.name)
      );

      return itemMatches;
    });
  }, [products, categoryFilter, categories]);

  // Add debug logging for initial data load
  useEffect(() => {
    if (products.length > 0) {
      console.log('Available Categories:', {
        fromProducts: [...new Set(products.map(p => p.category))],
        fromConfig: categories.map(c => c.name)
      });
    }
  }, [products]);

  // Add debug logging for category data
  useEffect(() => {
    console.log('Category Structure:', categories.map(cat => ({
      slug: cat.slug,
      name: cat.name,
      items: cat.items.map(item => item.name)
    })));
  }, []);

  // Add more detailed debug logging
  useEffect(() => {
    if (products.length > 0) {
      console.log('Category Mapping Debug:', {
        selectedCategory: categoryFilter,
        categoryFromData: categories.find(cat => cat.slug === categoryFilter),
        availableProductCategories: [...new Set(products.map(p => p.category))],
        productCount: products.length,
        filteredCount: filteredProducts.length
      });
    }
  }, [products, categoryFilter, filteredProducts]);

  // Add some debug logging
  console.log('Filtering products:', {
    categoryFilter,
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
    validCategories: categoryFilter !== 'all' 
      ? categories.find(cat => cat.slug === categoryFilter)?.items.map(item => item.name.toLowerCase())
      : ['all']
  });

  // Debug logging
  console.log('FeaturedProducts: Render State', {
    isLoading,
    hasError: !!error,
    productsCount: products.length,
    selectedCategory: categoryFilter,
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

  return (
    <section className="py-4 sm:py-6">
      {categoryFilter && categoryFilter !== 'all' ? (
        // Show filtered products in grid when a specific category is selected
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {categories.find(cat => cat.slug === categoryFilter)?.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {categories.find(cat => cat.slug === categoryFilter)?.tagline}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                quantity={getItemQuantity(product._id)}
                onAdd={handleAddToCart}
                onDecrement={handleDecrement}
              />
            ))}
          </div>
        </>
      ) : (
        // Show categories with horizontal product scrolling when "All" is selected
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryProducts = products.filter(product => {
              const normalizedProductCategory = normalizeString(product.category);
              const normalizedCategoryName = normalizeString(category.name);
              
              const hasMatchingItem = category.items.some(item => 
                normalizeString(product.item) === normalizeString(item.name)
              );

              return normalizedProductCategory === normalizedCategoryName || hasMatchingItem;
            });

            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.slug} className="relative">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.tagline}
                    </h2>
                    <p className="text-sm font-medium text-gray-600 mt-2">
                      {category.name}
                    </p>
                    <div className="mt-1 w-20 h-1 bg-primary/20 rounded-full"></div>
                  </div>
                  <Link 
                    href={`/?category=${category.slug}`}
                    className="text-primary hover:text-primary-dark text-sm font-medium
                             flex items-center gap-1 group mb-1"
                  >
                    View All 
                    <span className="transform transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </div>

                {/* Horizontal Scrollable Products */}
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-8 
                                bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 
                                bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                  
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                    {categoryProducts.map((product) => (
                      <div key={product._id} className="flex-none w-[280px]">
                        <ProductCard
                          product={product}
                          quantity={getItemQuantity(product._id)}
                          onAdd={handleAddToCart}
                          onDecrement={handleDecrement}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const EmptyState = () => (
  <div className="py-6 text-center text-gray-500">
    No products found in this category.
  </div>
);