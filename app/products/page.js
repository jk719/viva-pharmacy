// src/products/page.js
"use client"; // Ensures this component is treated as a client component

import { useCart } from '../../context/CartContext'; // Importing from CartContext
import products from '../../lib/products/data'; // Importing the products data

export default function ProductsPage() {
  const { addToCart } = useCart(); // Destructuring addToCart from useCart

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold mb-2 text-primary">{product.name}</h3>
              <p className="text-gray-700 mb-4">{product.description}</p>
              <p className="text-lg font-semibold mb-4">${product.price.toFixed(2)}</p>
              <button
                className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors duration-200"
                onClick={() => {
                  console.log(`Add to Cart clicked for: ${product.name}`);
                  addToCart(product);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
