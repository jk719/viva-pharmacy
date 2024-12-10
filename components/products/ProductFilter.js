// src/components/ProductFilter.js
export default function ProductFilter({ categories, selectedCategory, onChange }) {
    return (
      <div className="fixed w-full left-0 top-[260px] md:top-[160px] z-30 bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="mx-6 bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-2.5">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <label htmlFor="category" className="font-medium text-gray-700 text-sm md:text-base whitespace-nowrap">
                Filter by Category:
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={onChange}
                className="flex-1 p-1.5 md:p-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
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
      </div>
    );
}
