"use client";

import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowBack, IoAdd } from 'react-icons/io5';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import { useState, useCallback } from 'react';
import { categories } from '@/data/categories';
import { getCloudinaryUrl, FALLBACK_IMAGE } from '@/lib/cloudinary';

// Moved outside component to prevent recreation on each render
const getCategoryContent = (product) => ({
  Details: product => product.description || "No description available.",
  Ingredients: product => {
    const ingredients = product.activeIngredients
      ?.map(i => `${i.name} (${i.amount})`)
      .join(', ');
    return ingredients || "Ingredients information not available.";
  },
  Directions: product => product.directions || "Take as directed by your healthcare provider. Read all product information before use.",
  "Storage & Warnings": product => `Store at room temperature. Keep out of reach of children. ${product.warnings?.join('. ') || ''}`
});

export default function ClientProductView({ product }) {
  const { addToCart, decrement, items = [] } = useCart();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState('Details');
  const [imgError, setImgError] = useState(false);
  
  // Memoize the quantity calculation
  const getItemQuantity = useCallback((productId) => {
    if (!items?.length) return 0;
    const item = items.find(item => item?.id === productId || item?._id === productId);
    return item?.quantity || 0;
  }, [items]);

  const quantity = product ? getItemQuantity(product._id) : 0;

  const handleBack = () => {
    router.back();
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Normalize product data for cart
    const cartItem = {
      id: product._id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      quantity: 1
    };

    addToCart(cartItem);
  };

  const handleDecrement = () => {
    if (!product?._id) return;
    decrement(product._id);
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Get category information
  const category = categories.find(c => c.slug === product.categorySlug);
  const item = category?.items.find(i => i.slug === product.itemSlug);

  if (!product) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <p className="text-gray-600">Product details are not available.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-full"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  const sectionContent = getCategoryContent(product);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start md:items-center 
                justify-center p-2 md:p-4 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl 
                  rounded-2xl shadow-2xl relative overflow-hidden my-4 md:my-0"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          aria-label="Go back to previous page"
          className="absolute top-2 md:top-4 left-2 md:left-4 z-10 bg-white/90 backdrop-blur-sm 
                   text-gray-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center 
                   gap-1 md:gap-2 hover:bg-white text-sm md:text-base
                   shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <IoArrowBack className="text-base md:text-lg" />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="flex flex-col md:flex-row md:h-[60vh] lg:h-[65vh]">
          {/* Product Image */}
          <div className="flex-none md:flex-1 p-3 md:p-6 flex justify-center items-center 
                        relative group border-b md:border-b-0 md:border-r border-gray-100
                        h-[200px] md:h-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <Image
                src={imgError ? FALLBACK_IMAGE : (
                  product.imageUrl || 
                  (product.cloudinaryPublicId ? getCloudinaryUrl(product.cloudinaryPublicId) : FALLBACK_IMAGE)
                )}
                alt={product.name}
                width={300}
                height={300}
                priority
                onError={() => setImgError(true)}
                className="object-contain w-auto h-auto max-h-[150px] md:max-h-[300px] 
                         transform group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-3 md:p-6 flex flex-col overflow-y-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 md:space-y-4"
            >
              <div>
                <h1 id="product-details" className="text-lg md:text-2xl font-bold text-gray-800">
                  {product.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-500">
                  {category?.name} &gt; {item?.name}
                </p>
                {category?.tagline && (
                  <p className="text-primary text-xs md:text-sm italic mt-1">
                    {category.tagline}
                  </p>
                )}
                {product.shortDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              <p className="text-xl md:text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>

              {/* Add to Cart Button */}
              <div className="py-1 md:py-2">
                {quantity === 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white py-2 md:py-2.5 px-4 md:px-6 
                             rounded-full flex items-center justify-center gap-2 
                             hover:opacity-90 text-sm md:text-base
                             shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <IoAdd className="text-lg md:text-xl" />
                    <span className="font-medium">Add to Cart</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center justify-center gap-2 md:gap-3 
                               bg-gray-100 rounded-full p-1 md:p-1.5 shadow-inner">
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
              <div className="space-y-1 md:space-y-2 border-t pt-2">
                {Object.entries(sectionContent).map(([section, getContent]) => (
                  <motion.div
                    key={section}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => toggleSection(section)}
                      className="w-full group py-1.5 md:py-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base 
                                   group-hover:text-primary transition-colors duration-200">
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
                          <p className="text-xs md:text-sm text-gray-600 pb-2 md:pb-3 px-2">
                            {getContent(product)}
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