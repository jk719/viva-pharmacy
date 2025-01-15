// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeaturedProducts from '../components/products/FeaturedProducts';
import Link from 'next/link';
import { useCategory } from '@/context/CategoryContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowForward } from 'react-icons/io5';
import { fetchProducts } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Home() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [categories, setCategories] = useState(["All"]);
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
        const { success, products } = await fetchProducts();
        
        if (success && products.length > 0) {
          // Extract unique categories from products and sort them
          const uniqueCategories = ["All", ...new Set(products.map(p => p.category))].sort();
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setCategories(["All"]); // Fallback to just "All" if there's an error
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Filter Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white border-b shadow-sm"
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="relative px-4 py-3">
            <div 
              className="flex items-center space-x-3 overflow-x-auto 
                       scrollbar-thin scrollbar-thumb-gray-300 
                       scrollbar-track-transparent pb-2"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {!isLoading && categories.map((category) => (
                <motion.button
                  key={category}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    whitespace-nowrap px-4 py-1.5 rounded-full
                    text-sm font-medium transition-all duration-200
                    ${selectedCategory === category 
                      ? 'bg-primary text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                  `}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </motion.button>
              ))}
              
              {isLoading && (
                <div className="flex space-x-3">
                  {[1, 2, 3].map((n) => (
                    <div 
                      key={n}
                      className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Fade edges for better scroll indication */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Products Section */}
      <div className="container mx-auto px-4">
        <FeaturedProducts />
      </div>

      {/* View All Products CTA */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Link 
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 
                   bg-primary text-white rounded-full
                   hover:bg-primary/90 transition-all duration-300"
        >
          <span>View All Products</span>
          <IoArrowForward />
        </Link>
      </motion.section>
    </div>
  );
}
