"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/data/categories';
import { 
  FolderIcon, ChevronRightIcon, ArrowLeftIcon, 
  TableCellsIcon, ViewColumnsIcon, QuestionMarkCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon, BeakerIcon, HeartIcon, 
  SparklesIcon, FireIcon, SunIcon, 
  BoltIcon, ShieldCheckIcon, UserGroupIcon,
  MoonIcon, EyeIcon
} from '@heroicons/react/24/outline';

// Expanded category icon mapping
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
  'uncategorized': <QuestionMarkCircleIcon className="w-5 h-5" />,
  'featured': <StarIcon className="w-5 h-5" />,
  'default': <ShoppingBagIcon className="w-5 h-5" />
};

// Get icon for a category
const getIconForCategory = (slug) => categoryIcons[slug] || categoryIcons.default;

// Create an Uncategorized category object
const uncategorizedCategory = {
  name: "Uncategorized",
  slug: "uncategorized",
  tagline: "Products pending categorization",
  items: [{ name: "General", slug: "general" }]
};

// Create a Featured Items category object
const featuredCategory = {
  name: "Featured Items",
  slug: "featured",
  tagline: "Highlighted products",
  items: [{ name: "All Featured", slug: "all-featured" }]
};

export default function ProductCategoryBrowser({ 
  onSelectCategory, 
  onSelectItem,
  onReset,
  currentProducts,
  viewMode,
  onChangeViewMode
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Combine standard categories with uncategorized and featured categories
  const allCategories = useMemo(() => {
    return [featuredCategory, ...categories, uncategorizedCategory];
  }, []);

  // Category selection handling
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    onSelectCategory(category.slug);
  };

  // Item selection handling
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    onSelectItem(item.slug);
  };

  // Go back to all categories
  const handleGoBack = () => {
    setSelectedCategory(null);
    setSelectedItem(null);
    onReset();
  };

  // Count products in each category and item
  const categoryCounts = useMemo(() => {
    const counts = {};
    let uncategorizedCount = 0;
    let featuredCount = 0;
    
    if (!currentProducts) return counts;
    
    // Initialize with standard categories
    allCategories.forEach(category => {
      counts[category.slug] = { total: 0, items: {} };
      category.items.forEach(item => {
        counts[category.slug].items[item.slug] = 0;
      });
    });
    
    // Count by category and item
    currentProducts.forEach(product => {
      const catSlug = product.categorySlug || product.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const itemSlug = product.itemSlug;
      
      // Count featured products separately
      if (product.isFeatured) {
        counts["featured"].total++;
        counts["featured"].items["all-featured"]++;
        featuredCount++;
      }
      
      // Check if the category exists in our definitions
      const categoryExists = catSlug && allCategories.some(c => c.slug === catSlug);
      
      if (categoryExists) {
        // Known category
        counts[catSlug].total++;
        
        if (itemSlug && counts[catSlug].items[itemSlug] !== undefined) {
          counts[catSlug].items[itemSlug]++;
        } else {
          // Item not found, count under first item
          const firstItemSlug = allCategories.find(c => c.slug === catSlug)?.items[0]?.slug;
          if (firstItemSlug) {
            counts[catSlug].items[firstItemSlug] = (counts[catSlug].items[firstItemSlug] || 0) + 1;
          }
        }
      } else {
        // Unknown category - count as uncategorized
        counts["uncategorized"].total++;
        counts["uncategorized"].items["general"]++;
        uncategorizedCount++;
      }
    });
    
    return counts;
  }, [currentProducts, allCategories]);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
      {/* Header with navigation and view toggle */}
      <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <button 
              onClick={handleGoBack}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm font-medium">All Categories</span>
            </button>
          ) : (
            <span className="text-sm font-medium text-gray-700">Browse by Category</span>
          )}
          
          {selectedCategory && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                {getIconForCategory(selectedCategory.slug)}
                <span>{selectedCategory.name}</span>
              </span>
            </>
          )}
          
          {selectedItem && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-700">{selectedItem.name}</span>
            </>
          )}
        </div>
        
        <div className="flex gap-1">
          <button 
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => onChangeViewMode('grid')}
            title="Grid View"
          >
            <ViewColumnsIcon className="w-5 h-5" />
          </button>
          <button 
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => onChangeViewMode('table')}
            title="Table View"
          >
            <TableCellsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {/* Categories Grid */}
        {!selectedCategory && (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allCategories.map(category => {
                const count = categoryCounts[category.slug]?.total || 0;
                
                // Special styling for different categories
                const isUncategorized = category.slug === 'uncategorized';
                const isFeatured = category.slug === 'featured';
                
                let bgColor = 'bg-white';
                let borderColor = 'border-gray-200';
                let iconBgColor = 'bg-blue-50';
                let iconColor = 'text-blue-600';
                let textColor = 'text-gray-800';
                
                if (isUncategorized) {
                  bgColor = 'bg-amber-50';
                  borderColor = 'border-amber-300';
                  iconBgColor = 'bg-amber-100';
                  iconColor = 'text-amber-600';
                  textColor = 'text-amber-700';
                } else if (isFeatured) {
                  bgColor = 'bg-yellow-50';
                  borderColor = 'border-yellow-300';
                  iconBgColor = 'bg-yellow-100';
                  iconColor = 'text-yellow-600';
                  textColor = 'text-yellow-700';
                }
                
                return (
                  <motion.div
                    key={category.slug}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategorySelect(category)}
                    className={`${bgColor} ${count > 0 ? 'border-2' : 'border'} ${borderColor} rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-lg ${iconBgColor} ${iconColor} flex items-center justify-center`}>
                          {getIconForCategory(category.slug)}
                        </div>
                        <div>
                          <div className={`font-medium text-sm ${textColor}`}>
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {count > 0 ? `${count} products` : 'No products'}
                          </div>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        
        {/* Items Grid (when category is selected) */}
        {selectedCategory && (
          <motion.div
            key="items"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedCategory.items.map(item => {
                const count = categoryCounts[selectedCategory.slug]?.items[item.slug] || 0;
                const isUncategorized = selectedCategory.slug === 'uncategorized';
                const isFeatured = selectedCategory.slug === 'featured';
                
                let bgColorSelected = 'bg-green-50';
                let borderColorSelected = 'border-green-300';
                let bgColorHover = 'bg-white hover:border-green-300';
                let iconBgColor = 'bg-green-50';
                let iconColor = 'text-green-600';
                
                if (isUncategorized) {
                  bgColorSelected = 'bg-amber-50';
                  borderColorSelected = 'border-amber-300';
                  bgColorHover = 'bg-amber-50/30 hover:border-amber-300';
                  iconBgColor = 'bg-amber-100';
                  iconColor = 'text-amber-600';
                } else if (isFeatured) {
                  bgColorSelected = 'bg-yellow-50';
                  borderColorSelected = 'border-yellow-300';
                  bgColorHover = 'bg-yellow-50/30 hover:border-yellow-300';
                  iconBgColor = 'bg-yellow-100';
                  iconColor = 'text-yellow-600';
                }
                
                return (
                  <motion.div
                    key={item.slug}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemSelect(item)}
                    className={`
                      border rounded-lg p-3 cursor-pointer transition-all
                      ${selectedItem?.slug === item.slug 
                        ? `${bgColorSelected} ${borderColorSelected}` 
                        : bgColorHover}
                      ${count > 0 ? 'border-2' : 'border'}
                      hover:shadow-sm
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${iconBgColor} ${iconColor} flex items-center justify-center`}>
                        <FolderIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {count > 0 ? `${count} products` : 'No products'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 