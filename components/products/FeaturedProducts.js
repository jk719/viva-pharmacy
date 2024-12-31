"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCategory } from '../../context/CategoryContext';
import { motion } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import { fetchProducts } from '@/lib/api';

// Extracted components for better organization
const ProductCard = ({ product, quantity, onAdd, onDecrement }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-white rounded-2xl p-3 sm:p-4
                 min-w-[200px] max-w-[200px] 
                 sm:min-w-[280px] sm:max-w-[280px] 
                 scroll-snap-align-start border border-gray-100
                 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative h-36 sm:h-48 w-full mb-3 sm:mb-4 
                      rounded-xl overflow-hidden group">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-contain p-2"
            sizes="(max-width: 640px) 200px, 280px"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 
                        group-hover:opacity-100 transition-opacity duration-200 
                        flex items-center justify-center">
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 
                         rounded-full text-xs sm:text-sm font-medium 
                         text-gray-700 shadow-sm transform translate-y-2 
                         group-hover:translate-y-0 transition-transform duration-200">
              View Details
            </span>
          </div>
          
          <CartButton 
            quantity={quantity} 
            onAdd={onAdd} 
            onDecrement={onDecrement}
            product={product}
          />
        </div>
      </Link>

      <ProductInfo product={product} />
    </motion.div>
  );
};

const CartButton = ({ quantity, onAdd, onDecrement, product }) => (
  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
    {quantity === 0 ? (
      <AddButton onAdd={() => onAdd(product)} />
    ) : (
      <QuantityControls 
        quantity={quantity}
        onDecrement={() => onDecrement(product._id)}
        onAdd={() => onAdd(product)}
      />
    )}
  </div>
);

const AddButton = ({ onAdd }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      onAdd();
    }}
    className="flex items-center gap-1 bg-primary text-white 
             px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm
             hover:bg-primary/90 transition-colors duration-200"
  >
    <IoMdAdd className="text-base sm:text-lg" />
    <span>Add</span>
  </motion.button>
);

const QuantityControls = ({ quantity, onDecrement, onAdd }) => (
  <div 
    onClick={(e) => e.preventDefault()}
    className="flex items-center gap-1 bg-white rounded-full 
             p-0.5 sm:p-1 border border-gray-100"
  >
    <QuantityButton onClick={onDecrement} color="red" icon={<HiMinusSm />} />
    <span className="w-4 sm:w-6 text-center font-medium text-xs sm:text-base">
      {quantity}
    </span>
    <QuantityButton onClick={onAdd} color="green" icon={<HiPlusSm />} />
  </div>
);

const QuantityButton = ({ onClick, color, icon }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center 
              rounded-full text-${color}-500 hover:bg-${color}-50 
              transition-colors`}
  >
    {icon}
  </motion.button>
);

const ProductInfo = ({ product }) => (
  <div className="space-y-2 sm:space-y-3">
    <div className="space-y-1">
      <p className="text-base sm:text-lg font-bold text-primary">
        ${product.price.toFixed(2)}
      </p>
      <Link 
        href={`/products/${product._id}`}
        className="block text-gray-800 hover:text-primary 
                 transition-colors duration-200"
      >
        <h3 className="text-sm sm:text-base font-medium 
                     line-clamp-2 leading-snug">
          {product.name}
        </h3>
      </Link>
    </div>

    <p className="text-xs sm:text-sm text-gray-500 
                line-clamp-2 leading-relaxed">
      {product.description}
    </p>
  </div>
);

export default function FeaturedProducts() {
  const { addToCart, decrement, items = [] } = useCart();
  const { selectedCategory } = useCategory();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        console.log('Fetching products with params:', params);

        const data = await fetchProducts(params);
        if (data.success) {
          if (selectedCategory === 'All') {
            // Group and sort products by category
            const categoryCount = {};
            data.products.forEach(product => {
              categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
            });
            
            const sortedProducts = data.products.sort((a, b) => {
              return categoryCount[b.category] - categoryCount[a.category];
            });
            
            setProducts(sortedProducts);
          } else {
            setProducts(data.products);
          }
        } else {
          console.error('Failed to fetch products:', data.message);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  const categoriesWithCounts = [...new Set(products.map((product) => product.category))]
    .map((category) => ({
      name: category,
      count: products.filter((product) => product.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  const filteredCategories = selectedCategory === 'All' 
    ? categoriesWithCounts 
    : categoriesWithCounts.filter(category => category.name === selectedCategory);

  const getItemQuantity = useCallback((productId) => {
    const item = items?.find((item) => item?.id === productId);
    return item ? item.quantity : 0;
  }, [items]);

  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    addToCart({
      id: product._id, // Note: Changed from id to _id to match MongoDB
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleDecrement = (productId) => {
    decrement(productId);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="flex gap-6 overflow-x-auto">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="min-w-[280px] space-y-3">
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        No products found in this category.
      </div>
    );
  }

  return (
    <section className="py-4 sm:py-6">
      {filteredCategories.map((category) => (
        <CategorySection 
          key={category.name}
          category={category}
          products={products}
          getItemQuantity={getItemQuantity}
          onAddToCart={handleAddToCart}
          onDecrement={handleDecrement}
        />
      ))}
    </section>
  );
}

const LoadingState = () => (
  <div className="py-6">
    <div className="animate-pulse space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-6 overflow-x-auto">
            {[1, 2, 3].map((j) => (
              <div key={j} className="min-w-[280px] space-y-3">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="py-6 text-center text-gray-500">
    No products found in this category.
  </div>
);

const CategorySection = ({ 
  category, 
  products, 
  getItemQuantity, 
  onAddToCart, 
  onDecrement 
}) => (
  <div className="mb-8 sm:mb-12">
    <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
      <h2 className="text-xl sm:text-2xl font-bold text-primary relative">
        {category.name}
        <span className="absolute -bottom-2 left-0 w-1/3 h-1 
                      bg-primary rounded-full"></span>
      </h2>
      <span className="text-xs sm:text-sm text-gray-500">
        {category.count} items
      </span>
    </div>

    <div className="flex overflow-x-auto gap-4 sm:gap-6 
                  scroll-snap-x px-2 pb-4 -mx-2
                  scrollbar-thin scrollbar-thumb-gray-300 
                  scrollbar-track-transparent">
      {products
        .filter((product) => product.category === category.name)
        .map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            quantity={getItemQuantity(product._id)}
            onAdd={onAddToCart}
            onDecrement={onDecrement}
          />
        ))}
    </div>
  </div>
);