"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/data/categories';

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link 
            href={`/products?category=${category.slug}`}
            className="group relative h-48 rounded-lg overflow-hidden"
          >
            <Image
              src={category.image || '/images/category-placeholder.jpg'}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300
                         group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t 
                          from-black/60 to-transparent">
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-xl font-semibold">
                  {category.name}
                </h3>
                {category.tagline && (
                  <p className="text-white/90 text-sm italic">
                    {category.tagline}
                  </p>
                )}
                <p className="text-white/80 text-sm mt-1">
                  {category.items.length} items
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
} 