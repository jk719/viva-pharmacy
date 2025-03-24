"use client";

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { IoArrowForward } from 'react-icons/io5';
import Link from 'next/link';

export default function SubcategoryCarousel({ subcategory, products }) {
  // Only render if we have products and a subcategory name
  if (!subcategory || !products || products.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-primary">{subcategory}</h2>
          <span className="text-sm text-gray-500">({products.length})</span>
        </div>
        <Link 
          href={`/products?subcategory=${encodeURIComponent(subcategory)}`}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
        >
          View All
          <IoArrowForward />
        </Link>
      </div>

      <div className="relative">
        <div className="flex overflow-x-auto gap-2 sm:gap-4 pb-4 px-2 sm:px-4
                      scroll-snap-x scrollbar-thin scrollbar-thumb-gray-300 
                      scrollbar-track-transparent">
          {products.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-[160px] sm:min-w-[280px] scroll-snap-align-start"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 