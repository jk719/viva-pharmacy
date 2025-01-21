// src/components/ProductFilter.js
'use client';

import PropTypes from 'prop-types';
import { memo } from 'react';
import { categories } from '@/data/categories';

const ProductFilter = memo(function ProductFilter({ 
  categories: availableCategories,
  selectedCategory = 'All', 
  searchQuery = '',
  minPrice = '',
  maxPrice = '',
  onSearchChange,
  onPriceChange,
  onChange 
}) {
  return (
    <div className="w-full bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-3">
        <div className="flex flex-col space-y-4">
          {/* Categories */}
          <div 
            className="flex items-center -mx-3 px-3 overflow-x-auto scrollbar-hide" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
            role="group"
            aria-label="Product categories"
          >
            <div className="flex space-x-2 pb-0.5">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => onChange({ target: { value: category } })}
                  className={`
                    whitespace-nowrap px-3 py-1 rounded-full text-sm transition-colors
                    ${selectedCategory === category 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Price Filters */}
          <div className="flex flex-wrap gap-4">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => onPriceChange('min', e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => onPriceChange('max', e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCategory: PropTypes.string,
  searchQuery: PropTypes.string,
  minPrice: PropTypes.string,
  maxPrice: PropTypes.string,
  onSearchChange: PropTypes.func,
  onPriceChange: PropTypes.func,
  onChange: PropTypes.func
};

export default ProductFilter;
