"use client";

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function ProductGrid({ 
  products,
  layout = "grid" // "grid" or "scroll"
}) {
  if (!products?.length) {
    return (
      <div className="py-6 text-center text-gray-500">
        No products found in this category.
      </div>
    );
  }

  if (layout === "scroll") {
    return (
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 
                      bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 
                      bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {products.map((product) => (
            <div key={product._id} className="flex-none w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
        />
      ))}
    </motion.div>
  );
} 