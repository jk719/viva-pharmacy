// src/components/FeaturedProducts.js
"use client";

import Image from 'next/image';
import { useCart } from '../context/CartContext';

const products = [
  { id: 1, name: 'Vitamin C', description: 'Boosts immunity and supports skin health.', price: '$12.99', image: '/images/vitamin-c.png' },
  { id: 2, name: 'Fish Oil', description: 'Supports heart health and reduces inflammation.', price: '$15.99', image: '/images/fish-oil.png' },
  { id: 3, name: 'Multivitamins', description: 'Comprehensive daily supplement for overall health.', price: '$18.99', image: '/images/multivitamins.png' },
];

export default function FeaturedProducts() {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold mb-6 text-primary">Featured Products</h2> {/* Heading inside component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 w-full mb-4 flex items-center justify-center overflow-hidden rounded-lg">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-contain" 
              />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-lg font-bold text-secondary mb-4">{product.price}</p>
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
