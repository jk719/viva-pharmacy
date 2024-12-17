"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCategory } from '../../context/CategoryContext';
import products from '../../lib/products/data';
import { motion } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';

export default function FeaturedProducts() {
  const { addToCart, decrement, items = [] } = useCart();
  const { selectedCategory } = useCategory();

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

  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleDecrement = (productId) => {
    decrement(productId);
  };

  return (
    <section className="py-6">
      {filteredCategories.map((category) => (
        <div key={category.name} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary relative">
              {category.name}
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
            </h2>
            <span className="text-sm text-gray-500">
              {category.count} items
            </span>
          </div>

          <div className="flex overflow-x-auto gap-6 scroll-snap-x px-2 pb-4 -mx-2">
            {products
              .filter((product) => product.category === category.name)
              .map((product) => {
                const quantity = getItemQuantity(product.id);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-white rounded-2xl p-4 hover:shadow-lg transition-all duration-300 
                             min-w-[70%] max-w-[70%] sm:min-w-[280px] sm:max-w-[280px] scroll-snap-align-start 
                             border border-gray-100 relative group"
                  >
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden 
                                    group-hover:shadow-md transition-all duration-300">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          priority
                          className="object-contain p-2 transform group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 70vw, 280px"
                        />
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                          {quantity === 0 ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(product);
                              }}
                              className="flex items-center gap-1 bg-primary text-white 
                                       px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
                                       text-xs sm:text-sm
                                       hover:bg-primary/90 transition-colors duration-200 shadow-lg"
                            >
                              <IoMdAdd className="text-base sm:text-lg" />
                              <span>Add</span>
                            </motion.button>
                          ) : (
                            <div 
                              onClick={(e) => e.preventDefault()}
                              className="flex items-center gap-1 bg-white rounded-full p-0.5 sm:p-1 shadow-lg border border-gray-100"
                            >
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDecrement(product.id);
                                }}
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full
                                         text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <HiMinusSm className="text-base sm:text-lg" />
                              </motion.button>
                              <span className="w-5 sm:w-6 text-center font-medium text-sm sm:text-base">{quantity}</span>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleAddToCart(product);
                                }}
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full
                                         text-green-500 hover:bg-green-50 transition-colors"
                              >
                                <HiPlusSm className="text-base sm:text-lg" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                        <Link 
                          href={`/products/${product.id}`}
                          className="block group-hover:text-primary transition-colors duration-200"
                        >
                          <h3 className="text-base font-medium text-gray-800 line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="relative">
                        <p className="text-sm text-gray-500 line-clamp-2 hover:line-clamp-none 
                                    transition-all duration-200 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent 
                                      pointer-events-none group-hover:opacity-0 transition-opacity duration-200"></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </section>
  );
}