"use client"; // Mark the file as client-side

import { useCart } from '../../context/CartContext';

const products = [
  { id: 1, name: "Vitamin C", price: 12.99, description: "Boost your immunity with Vitamin C supplements." },
  { id: 2, name: "Omega-3 Fish Oil", price: 19.99, description: "Heart health support with Omega-3 fish oil." },
  { id: 3, name: "Multivitamins", price: 24.99, description: "Daily multivitamins for overall health." }
];

export default function Products() {
  const { addToCart } = useCart(); // Use addToCart from CartContext

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 shadow rounded">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-lg font-bold">${product.price}</p>
            <button
              onClick={() => addToCart(product)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
