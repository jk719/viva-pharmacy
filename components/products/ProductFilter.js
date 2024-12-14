// src/components/ProductFilter.js
export default function ProductFilter({ categories, selectedCategory, onChange }) {
  // Sort categories alphabetically, but keep "All" at the front if it exists
  const sortedCategories = categories.sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="w-full bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-1.5">
        <div className="flex items-center -mx-3 px-3 overflow-x-auto scrollbar-hide" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
          <div className="flex space-x-2 pb-0.5">
            {sortedCategories.map((category) => (
              <button
                key={category}
                onClick={() => onChange({ target: { value: category } })}
                className={`
                  whitespace-nowrap px-3 py-1 rounded-full text-xs transition-colors
                  ${selectedCategory === category 
                    ? 'bg-[#FF9F43] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
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
