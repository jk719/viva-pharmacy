// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import AuthButtons from "./AuthButtons";
import { useState } from "react";
import products from "../data/products"; // Assuming products data is imported here

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

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

  return (
    <nav className="p-4 bg-primary-color text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" legacyBehavior>
          <a className="flex items-center">
            <Image
              src="/images/viva-online-logo.png"
              alt="VIVA Pharmacy & Wellness Logo"
              width={180}
              height={60}
            />
          </a>
        </Link>
        
        {/* Search Bar */}
        <div className="flex-grow mx-4 relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search products..."
            className="w-full p-2 rounded-lg bg-white text-primary-color placeholder-primary-color focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filteredProducts.length > 0 && (
            <ul className="absolute left-0 right-0 mt-1 autocomplete-dropdown">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="autocomplete-item"
                  onClick={() => setQuery(product.name)}
                >
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Cart and Auth */}
        <div className="flex items-center space-x-6">
          <Link href="/cart" legacyBehavior>
            <a className="hover:underline flex items-center text-white">
              <ClientCartIcon />
            </a>
          </Link>
          <AuthButtons emailColor="text-red-600" />
        </div>
      </div>
    </nav>
  );
}
