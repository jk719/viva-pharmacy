// src/app/page.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeaturedProducts from '../components/products/FeaturedProducts';
import { useCategory } from '../context/CategoryContext';
import { motion } from 'framer-motion';
import { fetchProducts } from '@/lib/api';
import toast from 'react-hot-toast';
import SearchBar from '@/components/SearchBar';
import { categories as categoryData } from '@/data/categories';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [productCategories, setProductCategories] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const verified = searchParams.get('verified');
    const email = searchParams.get('email');
    const error = searchParams.get('error');
    
    if (verified === 'true' && email) {
      // Show verification success and login prompt
      toast.success('Email verified successfully!', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '10px',
        },
      });

      // Show login prompt after success message
      setTimeout(() => {
        toast((t) => (
          <div className="flex flex-col gap-3">
            <p className="font-medium">Please log in to continue</p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push('/?showLogin=true');
              }}
              className="bg-white text-primary px-4 py-2 rounded-md 
                         hover:bg-primary/10 transition-colors duration-200
                         font-medium text-sm"
            >
              Log in now
            </button>
          </div>
        ), {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            maxWidth: '320px',
          },
        });
      }, 3500);
    }
    
    if (error) {
      toast.error(error, {
        duration: 6000,
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          padding: '16px',
          borderRadius: '10px',
        },
      });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success && data.products?.length > 0) {
          const uniqueCategories = ["All", ...new Set(data.products.map(p => p.category))].sort();
          setProductCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setProductCategories(["All"]); // Fallback to default
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  const handleCategorySelect = useCallback((categorySlug) => {
    const newCategory = categorySlug.toLowerCase();
    setSelectedCategory(newCategory);
    router.push(`/?category=${newCategory}`, { scroll: false });
  }, [router, setSelectedCategory]);

  const showVerificationToast = useCallback((email) => {
    toast.success('Email verified successfully!', {
      duration: 3000,
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        padding: '16px',
        borderRadius: '10px',
      },
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white"
          >
            Your Health, Our Priority
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-8"
          >
            Browse our wide selection of pharmaceuticals and health products
          </motion.p>
          <SearchBar />
        </div>
      </div>

      {/* Category Filter Buttons with Horizontal Scroll */}
      <div className="sticky top-[120px] z-40 bg-white border-y border-gray-100">
        <div className="container mx-auto">
          <div className="relative flex items-center overflow-x-auto scrollbar-hide">
            {/* All Products Button - Fixed Width */}
            <div className="flex-none sticky left-0 z-10 bg-white/95 backdrop-blur-sm">
              <button
                key="all"
                onClick={() => handleCategorySelect('all')}
                className={`
                  whitespace-nowrap px-6 py-4
                  text-sm font-medium
                  transition-all duration-200
                  ${selectedCategory === 'all'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                  }
                `}
              >
                All Products
              </button>
            </div>

            {/* Scrollable Categories */}
            <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
              {categoryData.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategorySelect(category.slug)}
                  className={`
                    flex-none whitespace-nowrap px-6 py-4
                    text-sm font-medium
                    transition-all duration-200
                    ${selectedCategory === category.slug
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-primary'
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Gradient Fades */}
            <div className="absolute left-[100px] top-0 bottom-0 w-8 
                          bg-gradient-to-r from-white to-transparent 
                          pointer-events-none">
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-16 
                          bg-gradient-to-l from-white to-transparent 
                          pointer-events-none">
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <FeaturedProducts categoryFilter={selectedCategory} />
    </div>
  );
}
