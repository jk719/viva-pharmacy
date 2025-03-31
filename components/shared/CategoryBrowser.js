"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { categories } from '@/data/categories';
import {
  ShoppingBagIcon, BeakerIcon, HeartIcon, 
  SparklesIcon, FireIcon, SunIcon, 
  BoltIcon, ShieldCheckIcon, UserGroupIcon,
  ArrowLeftIcon, MagnifyingGlassIcon,
  XMarkIcon, MoonIcon, EyeIcon
} from '@heroicons/react/24/outline';

// Category icon mapping
const categoryIcons = {
  'pain-fever': <FireIcon className="w-5 h-5" />,
  'digestive-health': <BeakerIcon className="w-5 h-5" />,
  'allergy-care': <SparklesIcon className="w-5 h-5" />,
  'childrens-medicine-wellness': <UserGroupIcon className="w-5 h-5" />,
  'vitamins-supplements': <SunIcon className="w-5 h-5" />,
  'first-aid': <ShieldCheckIcon className="w-5 h-5" />,
  'sleep-aids': <MoonIcon className="w-5 h-5" />,
  'eye-care': <EyeIcon className="w-5 h-5" />,
  'oral-care': <SparklesIcon className="w-5 h-5" />,
  'default': <ShoppingBagIcon className="w-5 h-5" />
};

export default function CategoryBrowser({
  onSelectCategory,
  onSelectItem,
  selectedCategory = null,
  selectedItem = null,
  showImages = true,
  compact = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('categories'); // 'categories' or 'items'
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Reset to categories view when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) {
      setActiveView('categories');
    }
  }, [selectedCategory]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const term = searchTerm.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(term) ||
      cat.tagline?.toLowerCase().includes(term) ||
      cat.items.some(item => item.name.toLowerCase().includes(term))
    );
  }, [searchTerm, categories]);

  // Get current category object
  const currentCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find(c => c.slug === selectedCategory);
  }, [selectedCategory]);

  // Handler for selecting a category
  const handleCategorySelect = (category) => {
    onSelectCategory(category.slug);
    
    if (isMobile) {
      setActiveView('items');
    }
    
    // If only one item, select it automatically
    if (category.items.length === 1) {
      onSelectItem(category.items[0].slug);
    }
  };

  // Handler for selecting an item
  const handleItemSelect = (item) => {
    onSelectItem(item.slug);
  };

  // Get icon for category
  const getIconForCategory = (slug) => categoryIcons[slug] || categoryIcons.default;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      {/* Search bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Mobile: Back button when viewing items */}
          {isMobile && activeView === 'items' && currentCategory && (
            <div className="p-3 border-b flex items-center">
              <button 
                onClick={() => setActiveView('categories')}
                className="flex items-center text-blue-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Categories
              </button>
              <h3 className="ml-2 font-medium">{currentCategory.name}</h3>
            </div>
          )}

          {/* Categories Grid */}
          {(!isMobile || activeView === 'categories') && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'}`}>
                {filteredCategories.map(category => (
                  <div
                    key={category.slug}
                    onClick={() => handleCategorySelect(category)}
                    className={`
                      flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all
                      ${selectedCategory === category.slug 
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-sm' 
                        : 'bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-300'}
                    `}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 mb-2">
                      {getIconForCategory(category.slug)}
                    </div>
                    <span className="text-sm font-medium text-center">{category.name}</span>
                    {category.tagline && !compact && (
                      <span className="text-xs text-gray-500 mt-1 text-center">{category.tagline}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Items Grid (when category is selected) */}
          {(!isMobile || activeView === 'items') && currentCategory && (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: isMobile ? 20 : 0, y: isMobile ? 0 : 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isMobile ? 20 : 0, y: isMobile ? 0 : 20 }}
              className="p-4"
            >
              {!isMobile && (
                <h3 className="text-lg font-medium text-gray-900 mb-3">{currentCategory.name} Items</h3>
              )}
              
              <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-3'}`}>
                {currentCategory.items.map(item => (
                  <div
                    key={item.slug}
                    onClick={() => handleItemSelect(item)}
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer transition-all
                      ${selectedItem === item.slug 
                        ? 'bg-green-100 border-2 border-green-500 shadow-sm' 
                        : 'bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-300'}
                    `}
                  >
                    {showImages && item.image ? (
                      <div className="relative w-8 h-8 mr-2 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    )}
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected path indicator */}
      {selectedCategory && (
        <div className="bg-blue-50 p-3 rounded-b-lg border-t border-blue-100">
          <div className="text-sm flex items-center flex-wrap gap-1">
            <span className="font-medium">Selected:</span>
            <div className="flex items-center">
              {getIconForCategory(selectedCategory)}
              <span className="ml-1 text-blue-700">{categories.find(c => c.slug === selectedCategory)?.name}</span>
            </div>
            
            {selectedItem && (
              <>
                <span className="mx-1 text-gray-400">›</span>
                <span className="text-green-700">
                  {currentCategory?.items.find(i => i.slug === selectedItem)?.name}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 