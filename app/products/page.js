// src/products/page.js
"use client";

import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductFilter from '@/components/products/ProductFilter';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProducts } from '@/lib/api';

export default function ProductsPage() {
  const { addToCart, items } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imgErrors, setImgErrors] = useState({});

  // Get search parameters
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Use SWR hook for products
  const { products, isLoading, isError } = useProducts({
    category: category !== 'All' ? category : undefined,
    search,
    minPrice,
    maxPrice
  });

  // Extract unique categories from products
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      <div className="container mx-auto px-6 py-8">
        {!products || products.length === 0 ? (
          <div className="text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                imgError={imgErrors[product._id]}
                onImageError={() => {
                  setImgErrors(prev => ({...prev, [product._id]: true}));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted ProductCard component for better organization
const ProductCard = ({ product, onAddToCart, imgError, onImageError }) => (
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
        onClick={() => {
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
