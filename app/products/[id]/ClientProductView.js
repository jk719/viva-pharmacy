"use client";

import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaStar, FaStarHalf } from 'react-icons/fa';

export default function ClientProductView({ product }) {
  const { addToCart, decrement, items = [] } = useCart();
  const router = useRouter();

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
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Product details are not available.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
  };

  const handleDecrement = () => {
    if (!product) return;
    decrement(product.id);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <motion.button
          onClick={handleBack}
          className="absolute top-3 sm:top-6 left-3 sm:left-6 text-gray-600 hover:text-gray-900 
            bg-white/80 backdrop-blur-sm rounded-xl p-2 z-10
            border-2 border-gray-100 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft className="text-lg sm:text-xl" />
        </motion.button>

        <div className="flex flex-col md:flex-row md:h-[600px] max-h-[90vh]">
          {/* Product Image */}
          <div className="flex-1 bg-gray-50 p-4 sm:p-8 flex items-center justify-center 
            min-h-[250px] sm:min-h-[300px] md:h-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-full md:h-full"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 200px, (max-width: 1200px) 300px, 100%"
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4].map((star) => (
                    <FaStar key={star} className="text-sm sm:text-base" />
                  ))}
                  <FaStarHalf className="text-sm sm:text-base" />
                </div>
                <span className="text-sm text-gray-500">(2,415)</span>
              </div>

              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </div>

              <div className="py-2">
                {quantity === 0 ? (
                  <motion.button
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-xl font-medium
                      hover:bg-primary/90 transition-all duration-200"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add to Cart
                  </motion.button>
                ) : (
                  <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                    <motion.button
                      onClick={handleDecrement}
                      className="bg-red-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-medium
                        hover:bg-red-600 transition-all duration-200"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      -
                    </motion.button>
                    <span className="text-lg sm:text-xl font-medium w-8 sm:w-12 text-center">
                      {quantity}
                    </span>
                    <motion.button
                      onClick={handleAddToCart}
                      className="bg-primary text-white w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-medium
                        hover:bg-primary/90 transition-all duration-200"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      +
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4">
                {['Details', 'Ingredients', 'Directions'].map((section) => (
                  <motion.button
                    key={section}
                    className="w-full text-left py-2.5 px-4 rounded-xl bg-gray-50 
                      hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base"
                    whileHover={{ x: 4 }}
                  >
                    <h3 className="font-medium text-gray-900">{section}</h3>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}