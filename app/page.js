// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import FeaturedProducts from '../components/products/FeaturedProducts';
import ProductFilter from '@/components/products/ProductFilter';
import Link from 'next/link';
import { useCategory } from '@/context/CategoryContext';
import { products } from '@/data/products';

export default function Home() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [categories, setCategories] = useState(["All"]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Load categories from products data directly
  useEffect(() => {
    const uniqueCategories = ["All", ...new Set(
      products.map(product => product.category)
    )].sort();
    setCategories(uniqueCategories);
  }, []);

  const handlePriceChange = (type, value) => {
    // Validate price input
    const numValue = parseFloat(value);
    if (value && (isNaN(numValue) || numValue < 0)) {
      return;
    }

    if (type === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Prepare query parameters for the View All Products link
  const getQueryParams = () => {
    const params = {};
    
    if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }
    
    if (minPrice) {
      params.minPrice = minPrice;
    }
    
    if (maxPrice) {
      params.maxPrice = maxPrice;
    }

    return params;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b shadow-sm">
        <ProductFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          onChange={handleCategoryChange}
        />
      </div>

      <FeaturedProducts />

      <section className="my-8 text-center">
        <Link 
          href={{
            pathname: '/products',
            query: getQueryParams(),
          }}
          className="inline-block mt-4 px-6 py-2 bg-primary-color text-white rounded-lg 
                   hover:bg-blue-700 transition-colors duration-300"
        >
          View All Products
        </Link>
      </section>
    </div>
  );
}
