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
  console.log('Navbar: Component rendering');

  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState(false);

  // Memoized search function
  const searchProducts = useCallback((searchQuery) => {
    console.log('Navbar: Searching products with query:', searchQuery);
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
    }).slice(0, 5);

    console.log('Navbar: Found matching products:', results.length);
    setFilteredProducts(results);
  }, [setFilteredProducts]);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    searchProducts(input);
  };

  const handleProductClick = (productId) => {
    console.log('Navbar: Product clicked:', productId);
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

  useEffect(() => {
    console.log('Navbar: Session updated:', session?.user);
  }, [session]);

  const DefaultAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <svg 
        className="w-6 h-6 text-gray-400" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  return (
    <>
      <motion.nav 
        className="viva-navbar py-2 md:py-3 w-full shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-3 md:px-4">
          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden space-y-2">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/viva-online-logo.png"
                  alt="VIVA Logo"
                  width={120}
                  height={36}
                  className="h-8 w-auto"
                  style={{ height: '32px' }}
                  priority
                />
              </Link>
              
              <div className="flex items-center gap-2">
                {session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role) && (
                  <Link 
                    href="/admin"
                    className="text-white hover:text-white/80 transition-colors duration-300 text-sm"
                  >
                    Admin
                  </Link>
                )}
                <AuthButtons className="flex items-center text-sm scale-90" />
                <Link 
                  href="/cart"
                  className="flex items-center justify-center scale-90"
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
                className="w-full h-9 pl-9 pr-3 text-gray-900 placeholder-gray-500 
                  bg-white rounded-lg border border-gray-200
                  focus:border-[#FF9F43] focus:outline-none focus:ring-1 focus:ring-[#FF9F43]/50
                  text-sm transition-all"
                aria-label="Search products"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <Link href="/">
              <Image
                src="/images/viva-online-logo.png"
                alt="VIVA Pharmacy & Wellness Logo"
                width={300}
                height={100}
                className="viva-navbar-logo"
                style={{ height: 'auto' }}
                priority
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
                    bg-white rounded-xl border-2 border-gray-200
                    focus:border-[#FF9F43] focus:outline-none focus:ring-1 focus:ring-[#FF9F43]
                    transition-all"
                  aria-label="Search products"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role) && (
                <Link 
                  href="/admin"
                  className="text-white hover:text-white/80 transition-colors duration-300 font-medium"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link 
                href="/cart" 
                className="text-white hover:text-white/80 transition-colors duration-300"
              >
                <ClientCartIcon />
              </Link>
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-2">
                    {session.user.image ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User profile'}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = DefaultAvatar();
                          }}
                          priority
                        />
                      </div>
                    ) : (
                      <DefaultAvatar />
                    )}
                    <span className="text-white hover:text-white/80 transition-colors duration-300">
                      {session.user.name}
                    </span>
                  </Link>
                  <AuthButtons />
                </div>
              ) : (
                <AuthButtons />
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {filteredProducts.length > 0 && isFocused && (
              <motion.div 
                className="absolute left-3 right-3 md:left-4 md:right-4 mt-1 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden 
                  border border-gray-100 max-h-[60vh] overflow-y-auto">
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
