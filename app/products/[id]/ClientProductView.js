"use client";

import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoAdd } from 'react-icons/io5';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import { useState } from 'react';

const SECTION_CONTENT = {
  Details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  Ingredients: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
  Directions: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur."
};

export default function ClientProductView({ product }) {
  const { addToCart, decrement, items = [] } = useCart();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState(null);

  const handleBack = () => {
    router.back();
  };

  const getItemQuantity = (productId) => {
    if (!items) return 0;
    const item = items.find((item) => item?.id === productId);
    return item ? item.quantity : 0;
  };

  const quantity = product ? getItemQuantity(product.id) : 0;

  if (!product) {
    return <p>Product details are not available.</p>;
  }

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
  };

  const handleDecrement = () => {
    if (!product) return;
    decrement(product.id);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl rounded-2xl 
                  shadow-2xl relative overflow-hidden"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          aria-label="Go back to previous page"
          className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm text-gray-700 
                   px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white 
                   shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <IoArrowBack className="text-lg" />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="flex flex-col md:flex-row md:h-[60vh] lg:h-[65vh]">
          {/* Product Image - Removed grey background */}
          <div className="flex-1 p-4 md:p-6 flex justify-center items-center relative group
                        border-b md:border-b-0 md:border-r border-gray-100">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                priority
                className="object-contain w-auto h-auto max-h-[200px] md:max-h-[300px] 
                         transform group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-4 md:p-6 flex flex-col overflow-y-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 id="product-details" className="text-xl md:text-2xl font-bold text-gray-800">
                {product.name}
              </h1>

              <p className="text-2xl md:text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>

              {/* Add to Cart Button */}
              <div className="py-2">
                {quantity === 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white py-2.5 px-6 rounded-full 
                             flex items-center justify-center gap-2 hover:opacity-90 
                             shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <IoAdd className="text-xl" />
                    <span className="font-medium">Add to Cart</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center justify-center gap-3 bg-gray-100 
                               rounded-full p-1.5 shadow-inner">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDecrement}
                      className="w-8 h-8 flex items-center justify-center bg-white 
                               rounded-full text-red-500 hover:bg-red-50 shadow-sm 
                               hover:shadow-md transition-all duration-300"
                    >
                      <HiMinusSm className="text-lg" />
                    </motion.button>
                    <span className="w-10 text-center text-lg font-medium">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAddToCart}
                      className="w-8 h-8 flex items-center justify-center bg-white 
                               rounded-full text-green-500 hover:bg-green-50 shadow-sm 
                               hover:shadow-md transition-all duration-300"
                    >
                      <HiPlusSm className="text-lg" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-2 border-t pt-2">
                {Object.entries(SECTION_CONTENT).map(([section, content]) => (
                  <motion.div
                    key={section}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => toggleSection(section)}
                      className="w-full group py-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 group-hover:text-primary 
                                   transition-colors duration-200">
                          {section}
                        </h3>
                        <IoAdd className={`text-gray-400 group-hover:text-primary 
                                      transition-all duration-200 transform
                                      ${expandedSection === section ? 'rotate-45' : ''}`} />
                      </div>
                    </motion.button>
                    <AnimatePresence>
                      {expandedSection === section && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-gray-600 pb-3 px-2">
                            {content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}