// src/components/FeaturedProducts.js
"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import products from '../data/products';

export default function FeaturedProducts() {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef(null);

  // Categories state
  const categories = ['All', ...new Set(products.map((product) => product.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All'
    ? products.filter((product) => product.isFeatured)
    : products.filter((product) => product.isFeatured && product.category === selectedCategory);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.classList.add('scroll-animation');
      const animationTimeout = setTimeout(() => {
        container.classList.remove('scroll-animation');
      }, 3000);

      return () => clearTimeout(animationTimeout);
    }
  }, []);

  return (
    <section className="py-8">
      {/* Dynamic Heading */}
      <h2 className="text-3xl font-bold mb-6 text-primary">
        {selectedCategory === 'All' ? 'Featured Products' : selectedCategory}
      </h2>

      {/* Category Filter */}
      <div className="mb-6">
        <label htmlFor="category" className="mr-4 text-lg font-semibold">Filter by Category:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border rounded-lg bg-white text-primary-color"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 scroll-snap-x mx-2"
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="card bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-all duration-300 min-w-[250px] w-1/4 scroll-snap-align transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-full mb-4 flex items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={250}
                  height={250}
                  priority
                  className="object-contain"
                />
              </div>
              <h3 className="product-name text-lg font-semibold text-primary mb-2 text-center truncate hover:whitespace-normal">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4 text-center">{product.description}</p>
              <p className="text-lg font-bold text-secondary text-center mb-4">${product.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full py-2 text-white bg-primary hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-300"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
