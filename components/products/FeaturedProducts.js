"use client";

import { useCallback, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import toast from 'react-hot-toast';
import { categories } from '../../data/categories';
import { FaPills, FaSprayCan, FaThermometerHalf, FaHeadSideCough } from 'react-icons/fa';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';

// Constants
const CATEGORY_ICONS = {
  'oral-pain-relief': FaPills,
  'topical-pain-relief': FaSprayCan,
  'fever-reducers': FaThermometerHalf,
  'migraine-relief': FaHeadSideCough,
};

// Helper functions
const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

// Loading state component
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

// Empty state component
const EmptyState = () => (
  <div className="py-6 text-center text-gray-500">
    No products found in this category.
  </div>
);

// Subcategory grid component
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
            <div className="w-16 h-16 flex items-center justify-center text-gray-600 mb-3">
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
  const { isRateLimited } = useRateLimit();
  const { products, isLoading, error } = useProducts();

  // Add debugging logs
  useEffect(() => {
    console.log('FeaturedProducts: State update', {
      productsCount: products?.length || 0,
      isLoading,
      error,
      categoryFilter
    });
  }, [products, isLoading, error, categoryFilter]);

  // Filter products based on categoryFilter prop
  const filteredProducts = useMemo(() => {
    console.log('Filtering products:', {
      totalProducts: products?.length || 0,
      categoryFilter
    });

    if (!products?.length) {
      console.log('No products available to filter');
      return [];
    }

    if (!categoryFilter || categoryFilter === 'all') {
      console.log('Returning all products');
      return products;
    }
    
    const category = categories.find(cat => cat.slug === categoryFilter);
    if (!category) {
      console.log('Category not found:', categoryFilter);
      return [];
    }

    const filtered = products.filter(product => {
      const normalizedProductCategory = normalizeString(product.category);
      const normalizedProductItem = normalizeString(product.item || '');
      
      if (normalizedProductCategory === normalizeString(category.name)) {
        return true;
      }

      return category.items.some(item => 
        normalizedProductItem === normalizeString(item.name)
      );
    });

    console.log('Filtered products:', {
      categoryName: category.name,
      filteredCount: filtered.length
    });

    return filtered;
  }, [products, categoryFilter]);

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

  if (isLoading) return <LoadingState />;
  
  if (error && !error.isRateLimit) {
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

  if (!products || products.length === 0) return <EmptyState />;

  return (
    <section className="py-4 sm:py-6">
      {categoryFilter && categoryFilter !== 'all' ? (
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
              />
            ))}
          </div>
        </>
      ) : (
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
                    className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 group mb-1"
                  >
                    View All 
                    <span className="transform transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                  
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                    {categoryProducts.map((product) => (
                      <div key={product._id} className="flex-none w-[280px]">
                        <ProductCard
                          product={product}
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