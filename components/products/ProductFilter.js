// src/components/ProductFilter.js
'use client';

import PropTypes from 'prop-types';

export default function ProductFilter({ 
  categories = [], 
  selectedCategory = 'All', 
  onChange = () => {}         // Default empty function
}) {
  // Sort categories alphabetically, but keep "All" at the front if it exists
  const sortedCategories = categories.sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b);
  });

  // Safe category handler
  const handleCategoryChange = (category) => {
    onChange({ target: { value: category } });
  };

  return (
    <div className="w-full bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-3">
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
            {sortedCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  whitespace-nowrap px-3 py-1 rounded-full text-xs transition-colors
                  ${selectedCategory === category 
                    ? 'bg-[#FF9F43] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// PropTypes for type checking
ProductFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  selectedCategory: PropTypes.string,
  onChange: PropTypes.func
};
