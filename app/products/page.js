// src/products/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCart } from '@/context/CartContext';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductFilter from '@/components/products/ProductFilter';
import QuickViewModal from '@/components/products/QuickViewModal';
import ProductsLoadingSkeleton from '@/components/products/ProductsLoadingSkeleton';
import NoProductsFound from '@/components/products/NoProductsFound';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/lib/api';
import { IoGridOutline, IoListOutline } from 'react-icons/io5';

// Add this helper function at the top of the file
const groupProductsByCategory = (products) => {
  return products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = {
        products: [],
        tagline: product.categoryTagline
      };
    }
    acc[category].products.push(product);
    return acc;
  }, {});
};

export default function ProductsPage() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imgErrors, setImgErrors] = useState({});
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const loadingRef = useRef(false);

  // Get search parameters
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  // Setup infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  // Use SWR hook for products with pagination
  const { products, isLoading, isError, mutate } = useProducts({
    category: category !== 'All' ? category : undefined,
    search,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12
  });

  useEffect(() => {
    if (products && products.length > 0) {
      // Log sample product data
      console.log('Frontend: Sample product:', {
        name: products[0]?.name,
        category: products[0]?.category,
        tagline: products[0]?.categoryTagline
      });

      // Log grouped data
      const grouped = groupProductsByCategory(products);
      const firstCategory = Object.keys(grouped)[0];
      console.log('Frontend: Sample grouped category:', {
        category: firstCategory,
        tagline: grouped[firstCategory]?.tagline,
        productCount: grouped[firstCategory]?.products.length
      });
    }
  }, [products]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && !isLoading && !loadingRef.current && products?.length >= 12) {
      loadingRef.current = true;
      setPage(prev => prev + 1);
      setTimeout(() => {
        loadingRef.current = false;
      }, 500);
    }
  }, [inView, isLoading, products]);

  // Extract unique categories
  const categories = products 
    ? ['All', ...new Set(products.map(p => p.category))]
    : ['All'];

  const updateSearchParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/products?${params.toString()}`);
    setPage(1); // Reset page when filters change
  };

  const handleSearchChange = (value) => {
    updateSearchParams({ search: value });
  };

  const handlePriceChange = (type, value) => {
    updateSearchParams({ 
      [type === 'min' ? 'minPrice' : 'maxPrice']: value 
    });
  };

  const handleCategoryChange = (e) => {
    updateSearchParams({ 
      category: e.target.value === 'All' ? '' : e.target.value 
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            Error loading products. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <ProductFilter 
          categories={categories}
          selectedCategory={category}
          searchQuery={search}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onSearchChange={handleSearchChange}
          onPriceChange={handlePriceChange}
          onChange={handleCategoryChange}
        />
        
        {/* View Toggle & Sort */}
        <div className="container mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <IoGridOutline size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : ''}`}
            >
              <IoListOutline size={20} />
            </button>
          </div>
          <select
            value={sort}
            onChange={(e) => updateSearchParams({ sort: e.target.value })}
            className="p-2 border rounded-lg"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {isLoading && page === 1 ? (
            <ProductsLoadingSkeleton view={view} />
          ) : !products || products.length === 0 ? (
            <NoProductsFound />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupProductsByCategory(products)).map(([category, { products: categoryProducts, tagline }]) => (
                <div key={category} className="space-y-4">
                  <div className="border-b pb-2">
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl font-bold text-gray-800"
                    >
                      {category}
                    </motion.h2>
                    {tagline && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-primary mt-1 italic"
                      >
                        {tagline}
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={
                      view === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                    }
                  >
                    {categoryProducts.map((product) => (
                      <ProductCard 
                        key={product._id}
                        product={product}
                        view={view}
                        onAddToCart={addToCart}
                        onQuickView={() => {
                          setSelectedProduct(product);
                          setShowQuickView(true);
                        }}
                        imgError={imgErrors[product._id]}
                        onImageError={() => {
                          setImgErrors(prev => ({...prev, [product._id]: true}));
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isLoading && page > 1 && <LoadingSpinner />}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
}

// Extracted ProductCard component for better organization
const ProductCard = ({ product, view, onAddToCart, onQuickView, imgError, onImageError }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition-all duration-300"
  >
    <Link href={`/products/${product._id}`}>
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        {!imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            onError={() => {
              console.error('Image failed to load:', product.image);
              onImageError();
            }}
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <p className="text-gray-500">Image not available</p>
            <p className="text-xs text-gray-400 mt-2">{product.image}</p>
          </div>
        )}
      </div>
    </Link>

    <h3 className="text-xl font-bold mb-2 text-primary">{product.name}</h3>
    <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
    <div className="flex items-center justify-between">
      <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
      <button
        className="bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/90 
                   transition-colors duration-200 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
          });
        }}
      >
        Add to Cart
      </button>
    </div>
  </motion.div>
);
