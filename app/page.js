// src/app/page.js
"use client";

import FeaturedProducts from '../components/products/FeaturedProducts';
import ProductFilter from '@/components/products/ProductFilter';
import Link from 'next/link';
import { useCategory } from '@/context/CategoryContext';
import products from '../lib/products/data';

export default function Home() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const categories = ["All", ...new Set(products.map(product => product.category))];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b shadow-sm">
        <ProductFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        />
      </div>

      {/* FeaturedProducts component now handles the heading */}
      <FeaturedProducts />

      {/* View All Products Button */}
      <section className="my-8 text-center">
        <Link 
          href="/products" 
          className="inline-block mt-4 px-6 py-2 bg-primary-color text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          View All Products
        </Link>
      </section>
    </div>
  );
}
