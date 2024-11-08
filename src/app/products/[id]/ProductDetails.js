// src/app/products/[id]/ProductDetails.js
"use client";

import { useCart } from '../../../context/CartContext';

export default function ProductDetails({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>
      <p className="text-lg font-bold mb-6">${product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add to Cart
      </button>
    </div>
  );
}
