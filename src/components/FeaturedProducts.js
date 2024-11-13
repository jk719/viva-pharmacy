// src/components/FeaturedProducts.js
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import products from '../data/products';
import { useState } from 'react';
import ProductFilter from './ProductFilter';

export default function FeaturedProducts() {
  const { addToCart, decrement, cartItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories with counts
  const categoriesWithCounts = [...new Set(products.map((product) => product.category))]
    .map((category) => ({
      name: category,
      count: products.filter((product) => product.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  const categories = ['All', ...categoriesWithCounts.map(category => category.name)];

  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleDecrement = (product) => {
    decrement(product.id);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <section className="py-8">
      {/* Sticky Filter */}
      <ProductFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onChange={handleCategoryChange}
      />

      {categoriesWithCounts
        .filter(category => selectedCategory === 'All' || category.name === selectedCategory)
        .map((category) => (
          <div key={category.name} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">{category.name}</h2>

            {/* Products List - Horizontal Scroll */}
            <div className="flex overflow-x-auto gap-4 scroll-snap-x px-2">
              {products
                .filter((product) => product.category === category.name)
                .map((product) => {
                  const quantity = getItemQuantity(product.id);

                  return (
                    <div
                      key={product.id}
                      className="card bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-all duration-300 min-w-[70%] max-w-[70%] sm:w-1/4 scroll-snap-align transform hover:scale-105"
                    >
                      <div className="flex flex-col items-center">
                        {/* Product Image with Link */}
                        <Link href={`/products/${product.id}`}>
                          <div className="relative h-40 w-full mb-2 flex items-center justify-center overflow-hidden rounded-lg cursor-pointer">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={250}
                              height={250}
                              priority
                              className="object-contain w-auto h-auto"
                            />
                          </div>
                        </Link>

                        {/* Quantity Controls - Positioned Below Image */}
                        <div className="quantity-controls mb-2" role="group" aria-label="Quantity controls">
                          {quantity === 0 ? (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="add-button"
                              aria-label="Add to cart"
                            >
                              Add +
                            </button>
                          ) : (
                            <div className="flex items-center">
                              <button
                                onClick={() => handleDecrement(product)}
                                className="quantity-button"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="quantity-display">{quantity}</span>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="quantity-button"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Product Price */}
                        <p className="text-lg font-bold text-secondary text-center mb-1">${product.price.toFixed(2)}</p>
                        
                        {/* Product Name */}
                        <h3 className="product-name text-md font-semibold text-primary text-center mb-1 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Product Description (Expandable on Hover) */}
                        <p className="product-description text-gray-600 text-center line-clamp-2 hover:line-clamp-none transition-all duration-200 mb-2">
                          {product.description}
                        </p>

                        {/* Rating */}
                        <div className="flex justify-center items-center text-yellow-500">
                          <span className="text-sm">★★★★★</span> {/* Replace with dynamic rating */}
                          <span className="text-xs text-gray-500 ml-1">(20)</span> {/* Replace with actual reviews */}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
    </section>
  );
}
