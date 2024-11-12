// src/components/ProductFilter.js
export default function ProductFilter({ categories, selectedCategory, onChange }) {
    return (
      <div className="sticky top-16 z-10 mb-4 bg-white p-4 shadow-md rounded-lg"> {/* Adjust top to be below navbar */}
        <label htmlFor="category" className="mr-4 text-lg font-semibold text-primary-color">Filter by Category:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={onChange}
          className="p-2 border border-primary-color rounded-lg bg-white text-primary-color"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    );
}
