// src/products/page.js
"use client"; // Ensures this component is treated as a client component

import { useCart } from '../../context/CartContext'; // Importing from CartContext
import products from '../../lib/products/data'; // Importing the products data

export default function ProductsPage() {
  const { addToCart } = useCart(); // Destructuring addToCart from useCart

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Product Listing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 shadow-lg rounded-lg">
            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-lg font-semibold mb-4">${product.price.toFixed(2)}</p>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => {
                console.log(`Add to Cart clicked for: ${product.name}`);  // Debugging log
                addToCart(product);  // Call addToCart
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
