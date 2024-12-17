// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import { AuthButtons } from "./auth";
import VerificationAlert from "./VerificationAlert";
import { useState } from "react";
import products from "../data/products";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();
  const { data: session } = useSession();

  const handleInputChange = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (input) {
      const results = products.filter((product) =>
        product.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
    setQuery("");
    setFilteredProducts([]);
  };

  return (
    <>
      <nav className="bg-primary-color shadow-lg">
        <div className="container mx-auto px-4 py-3">
          {/* Mobile Layout */}
          <div className="flex flex-col md:hidden space-y-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/images/viva-online-logo.png"
                  alt="VIVA Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>

              <div className="flex items-center gap-4">
                <AuthButtons />
                <Link href="/cart" className="relative hover:opacity-80 transition-opacity">
                  <ClientCartIcon />
                </Link>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search products..."
                className="w-full h-10 px-4 rounded-full text-gray-800 bg-white/90 backdrop-blur-sm
                         border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                         placeholder:text-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between md:gap-8">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/viva-online-logo.png"
                alt="VIVA Pharmacy & Wellness Logo"
                width={200}
                height={70}
                className="h-12 w-auto"
              />
            </Link>

            <div className="flex-1 max-w-2xl relative">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search products..."
                className="w-full h-11 px-6 rounded-full text-gray-800 bg-white/90 backdrop-blur-sm
                         border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                         placeholder:text-gray-500 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-6">
              <Link 
                href="/cart" 
                className="relative hover:opacity-80 transition-opacity p-2"
              >
                <ClientCartIcon />
              </Link>
              <AuthButtons />
            </div>
          </div>

          {/* Search Results Dropdown - Improved styling */}
          {filteredProducts.length > 0 && (
            <div className="relative z-50">
              <ul className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100
                           max-h-[60vh] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer
                             transition-colors duration-150 border-b border-gray-100 last:border-none"
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      <VerificationAlert />
    </>
  );
}
