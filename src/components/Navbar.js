// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import AuthButtons from "./AuthButtons";
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
    // Navigate to the product page
    router.push(`/products/${productId}`);
    // Clear the search bar and suggestions after navigation
    setQuery("");
    setFilteredProducts([]);
  };

  return (
    <nav className="bg-primary-color text-white py-4 fixed top-0 w-full z-20">
      <div className="container mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center md:justify-between mb-2">
          <Link href="/" legacyBehavior>
            <a>
              <Image
                src="/images/viva-online-logo.png"
                alt="VIVA Pharmacy & Wellness Logo"
                width={180}
                height={60}
              />
            </a>
          </Link>
        </div>

        {/* Auth */}
        <div className="flex justify-center mb-2">
          <AuthButtons />
        </div>

        {/* Search Bar and Cart Icon - Third line on mobile when signed in */}
        <div className={`relative flex items-center space-x-2 ${session ? 'mt-2' : ''} md:mt-0`}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search products..."
            className="w-full p-2 rounded-lg bg-white text-blue-900 placeholder-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:max-w-sm"
          />
          <Link href="/cart" legacyBehavior>
            <a className="text-white">
              <ClientCartIcon />
            </a>
          </Link>

          {filteredProducts.length > 0 && (
            <ul className="absolute top-full mt-1 w-full bg-white text-blue-900 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto z-30">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:justify-between md:items-center">
          <div className="relative flex items-center space-x-4">
            {/* Desktop content if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
}
