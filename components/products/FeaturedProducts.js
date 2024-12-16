"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCategory } from '../../context/CategoryContext';
import products from '../../lib/products/data';
import { motion } from 'framer-motion';
import { HiPlus, HiMinus } from 'react-icons/hi';
import { useState } from 'react';

export default function FeaturedProducts() {
  const { addToCart, decrement, items = [] } = useCart();
  const { selectedCategory } = useCategory();
  const [scrollPosition, setScrollPosition] = useState(0);

  const categoriesWithCounts = [...new Set(products.map((product) => product.category))]
    .map((category) => ({
      name: category,
      count: products.filter((product) => product.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  const filteredCategories = selectedCategory === 'All' 
    ? categoriesWithCounts 
    : categoriesWithCounts.filter(category => category.name === selectedCategory);

  const getItemQuantity = (productId) => {
    const item = items?.find((item) => item?.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Prevent navigation when clicking add button
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleDecrement = (productId, e) => {
    e.preventDefault(); // Prevent navigation
    decrement(productId);
  };

  return (
    <section className="py-6 bg-white">
      {filteredCategories.map((category) => (
        <div key={category.name} className="mb-10">
          <div className="flex justify-between items-center mb-6 px-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {category.name}
            </h2>
            <Link 
              href={`/category/${category.name}`}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-all 
                hover:translate-x-1 duration-200 flex items-center gap-1"
            >
              View All <span className="text-lg">→</span>
            </Link>
          </div>

          <div className="relative bg-white">
            <div className="flex overflow-x-auto gap-4 scroll-snap-x pb-4 scrollbar-hide">
              {products
                .filter((product) => product.category === category.name)
                .map((product, index) => {
                  const quantity = getItemQuantity(product.id);

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className={`flex-none w-[42%] sm:w-[280px] group scroll-snap-start ${
                        index === 0 ? 'ml-4' : ''
                      }`}
                    >
                      <motion.div 
                        className="bg-white rounded-3xl p-3 sm:p-4 border-2 border-gray-100 
                          hover:border-primary/20 transition-all duration-300"
                        whileHover={{ 
                          y: -8,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="relative aspect-square mb-3 sm:mb-4 rounded-2xl overflow-hidden bg-gray-50/50">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-contain p-2 sm:p-4 transition-all duration-300 
                              group-hover:scale-110 group-hover:rotate-2"
                            priority
                          />
                        </div>

                        <div className="space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <p className="text-base sm:text-lg font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </p>
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                              <span className="text-yellow-400 text-xs">★★★★★</span>
                              <span className="text-gray-500 ml-1 text-xs">(20)</span>
                            </div>
                          </div>

                          <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 
                            group-hover:text-primary transition-colors duration-200">
                            {product.name}
                          </h3>

                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                            {product.description}
                          </p>

                          <div className="pt-2">
                            {quantity === 0 ? (
                              <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="w-full bg-primary text-white py-3 rounded-xl font-medium
                                  hover:bg-primary/90 active:scale-[0.98] transition-all duration-200
                                  group-hover:shadow-lg group-hover:shadow-primary/25"
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-3 bg-gray-50 
                                rounded-xl p-1 group-hover:bg-primary/5 transition-colors">
                                <button
                                  onClick={(e) => handleDecrement(product.id, e)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 
                                    hover:bg-white rounded-lg transition-all hover:shadow-sm"
                                >
                                  <HiMinus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button
                                  onClick={(e) => handleAddToCart(product, e)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-600 
                                    hover:bg-white rounded-lg transition-all hover:shadow-sm"
                                >
                                  <HiPlus className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}