// src/components/ProductFilter.js
export default function ProductFilter({ categories, selectedCategory, onChange }) {
    return (
      <div className="w-full bg-white shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 md:px-4 py-2">
          <div className="flex flex-col space-y-1">
            <h2 className="text-base font-semibold">Filter by Category:</h2>
            <select
              value={selectedCategory}
              onChange={onChange}
              className="w-full p-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
}
