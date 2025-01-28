// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FeaturedProducts from '../components/products/FeaturedProducts';
import Link from 'next/link';
import { useCategory } from '@/context/CategoryContext';
import { motion } from 'framer-motion';
import { IoArrowForward } from 'react-icons/io5';
import { fetchProducts } from '@/lib/api';
import toast from 'react-hot-toast';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [categories, setCategories] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('featured');
  
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
          setCategories(uniqueCategories);
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
          setCategories(["All"]); // Fallback to default
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setCategories(["All"]); // Fallback to default
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

      {/* Product Tabs */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          {['Featured', 'New Arrivals', 'Best Sellers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base ${
                activeTab === tab.toLowerCase()
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <FeaturedProducts />
      </div>

      {/* View All Products CTA */}
      <div className="text-center py-6 sm:py-8">
        <Link 
          href="/products"
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 
                   bg-primary text-white rounded-full
                   hover:bg-primary/90 transition-all duration-300"
        >
          <span>View All Products</span>
          <IoArrowForward />
        </Link>
      </div>
    </div>
  );
}
