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
import { FiSettings } from 'react-icons/fi';

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

const AdminDashboardButton = () => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link 
      href="/admin"
      className="flex items-center gap-2 px-4 py-2 
                 bg-[#4CAF50] rounded-lg
                 hover:bg-[#45a049] transition-all duration-300
                 shadow-md"
    >
      <FiSettings 
        className="w-4 h-4 text-white" 
      />
      <span className="font-medium text-white">Admin Dashboard</span>
    </Link>
  </motion.div>
);

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState(false);

  // Memoize search function with useCallback
  const searchProducts = useCallback(
    debounce((searchQuery) => {
      if (!searchQuery.trim()) {
        setFilteredProducts([]);
        return;
      }

      const searchTerms = searchQuery.toLowerCase().split(' ');
      const results = products
        .filter((product) => {
          const productName = product.name.toLowerCase();
          const productCategory = product.category.toLowerCase();
          const productDescription = product.description.toLowerCase();

          return searchTerms.every(term => 
            productName.includes(term) || 
            productCategory.includes(term) || 
            productDescription.includes(term)
          );
        })
        .slice(0, 5);

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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 
                               bg-[#4CAF50] rounded-md
                               hover:bg-[#45a049] transition-all duration-300"
                  >
                    <FiSettings 
                      className="w-3.5 h-3.5 text-white" 
                    />
                    <span className="text-white">Admin</span>
                  </Link>
                </motion.div>
                <AuthButtons className="flex items-center text-sm scale-90" />
                <Link 
                  href="/cart"
                  className="flex items-center justify-center scale-90"
                >
                  <ClientCartIcon />
                </Link>
              </div>
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

            <div className="flex items-center space-x-6">
              {session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role) && (
                <AdminDashboardButton />
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
        </div>
      </motion.nav>

      <VerificationAlert />
    </>
  );
}
