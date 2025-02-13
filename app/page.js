// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
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
                router.push('/login');
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
        const { success, products, error } = await fetchProducts();
        
        if (success && products?.length > 0) {
          const uniqueCategories = ["All", ...new Set(products.map(p => p.category))].sort();
          setProductCategories(uniqueCategories);
        } else if (error) {
          console.error('Error loading products:', error);
          toast.error('Failed to load products', {
            style: {
              background: '#EF4444',
              color: '#FFFFFF',
              padding: '16px',
              borderRadius: '10px',
            },
          });
          setProductCategories(["All"]); // Fallback to default
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProductCategories(["All"]); // Fallback to default
        toast.error('Unable to load categories', {
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    // Get category from URL on initial load
    const categoryFromUrl = searchParams.get('category') || 'all';
    setSelectedCategory(categoryFromUrl);
  }, [searchParams]);

  const handleCategorySelect = (categorySlug) => {
    const newCategory = categorySlug.toLowerCase();
    setSelectedCategory(newCategory);
    router.push(`/?category=${newCategory}`, { scroll: false });
  };

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

      {/* Product Categories - Only show when 'all' is selected */}
      {selectedCategory === 'all' && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {categoryData.map((category) => (
            <section key={category.slug} className="py-4 sm:py-6">
              <div className="mb-8 sm:mb-12">
                <div className="flex flex-col mb-4 sm:mb-6 px-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary relative">
                    {category.name}
                    <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 italic">{category.tagline}</p>
                  <span className="text-xs sm:text-sm text-gray-500 mt-1">
                    {category.items.length} items
                  </span>
                </div>
                
                <div className="flex overflow-x-auto gap-4 sm:gap-6 scroll-snap-x px-2 pb-4 -mx-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {category.items.map((item) => (
                    <div
                      key={item.slug}
                      className="card bg-white rounded-2xl p-3 sm:p-4 min-w-[200px] max-w-[200px] sm:min-w-[280px] sm:max-w-[280px] scroll-snap-align-start border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                    >
                      <a href={`/categories/${category.slug}/${item.slug}`}>
                        <div className="relative h-36 sm:h-48 w-full mb-3 sm:mb-4 rounded-xl overflow-hidden group">
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 rounded-full text-xs sm:text-sm font-medium text-gray-700 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                              View Products
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-sm sm:text-base font-medium line-clamp-2 leading-snug text-gray-800 hover:text-primary transition-colors duration-200">
                            {item.name}
                          </h3>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
