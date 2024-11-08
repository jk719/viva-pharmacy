// src/app/products/page.js
"use client"; // Ensures this component is treated as a client component

import { useCart } from '../../context/CartContext'; // Ensures correct path for CartContext

export default function ProductsPage() {
  const { addToCart } = useCart();  // Destructure addToCart from useCart to handle adding products

  // List of products for display
  const products = [
    { id: 1, name: 'Vitamin C', price: 12.99, description: 'Boost your immunity with Vitamin C supplements.' },
    { id: 2, name: 'Omega-3 Fish Oil', price: 19.99, description: 'Heart health support with Omega-3 fish oil.' },
    { id: 3, name: 'Multivitamins', price: 24.99, description: 'Daily multivitamins for overall health.' },
    { id: 4, name: 'Calcium Tablets', price: 14.99, description: 'Calcium tablets for bone health.' },
  ];

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
                addToCart(product);  // Call addToCart from CartContext
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
