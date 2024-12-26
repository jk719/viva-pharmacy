// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import { AuthButtons } from "./auth";
import VerificationAlert from "./VerificationAlert";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { products } from '@/data/products'; // Import the products directly

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Memoized search function
  const searchProducts = useCallback(
    debounce((searchQuery) => {
      if (!searchQuery.trim()) {
        setFilteredProducts([]);
        return;
      }

      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      const results = products.filter((product) => {
        const productName = product.name.toLowerCase();
        const productCategory = product.category.toLowerCase();
        const productDescription = product.description.toLowerCase();

        return searchTerms.every(term => 
          productName.includes(term) || 
          productCategory.includes(term) || 
          productDescription.includes(term)
        );
      }).slice(0, 5); // Limit to 5 results for better performance

      setFilteredProducts(results);
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    searchProducts(input);
  };

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
    setQuery("");
    setFilteredProducts([]);
    setIsFocused(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      setFilteredProducts([]);
    }
  };

  return (
    <>
      <motion.nav 
        className="bg-primary text-white py-3 w-full shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden space-y-3">
            <div className="flex items-center justify-between px-1">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/viva-online-logo.png"
                  alt="VIVA Logo"
                  width={140}
                  height={42}
                  className="h-7 w-auto -ml-1"
                  priority
                />
              </Link>
              
              <div className="flex items-center gap-3">
                <AuthButtons className="flex items-center text-sm" />
                <Link 
                  href="/cart"
                  className="flex items-center justify-center w-8 h-8"
                >
                  <ClientCartIcon />
                </Link>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder="Search products..."
                className="w-full h-9 pl-10 pr-4 text-gray-900 placeholder-gray-500 
                  bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50
                  focus:border-white focus:outline-none focus:ring-0 transition-all"
                aria-label="Search products"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <Link href="/">
              <Image
                src="/images/viva-online-logo.png"
                alt="VIVA Pharmacy & Wellness Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </Link>

            <div className="flex-1 max-w-xl mx-8 relative">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="w-full h-12 pl-12 pr-4 text-gray-900 placeholder-gray-500 
                    bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50
                    focus:border-white focus:outline-none focus:ring-0 transition-all"
                  aria-label="Search products"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link 
                href="/cart" 
                className="text-white hover:text-white/80 transition-colors duration-300"
              >
                <ClientCartIcon />
              </Link>
              <AuthButtons />
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {filteredProducts.length > 0 && isFocused && (
              <motion.div 
                className="absolute left-4 right-4 mt-2 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden 
                  border-2 border-gray-100 max-h-[300px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <motion.button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-50 
                        flex items-center space-x-3 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">${product.price}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <VerificationAlert />
    </>
  );
}
