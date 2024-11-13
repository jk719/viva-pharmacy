// src/app/products/[id]/ClientProductView.js
"use client";

import { useCart } from '../../../context/CartContext';
import Image from 'next/image';

export default function ClientProductView({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white p-6 shadow rounded">
      <div className="flex justify-center mb-4">
        <Image
          src={product.image}
          alt={product.name}
          width={250}
          height={250}
          className="object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>
      <p className="text-lg font-bold mb-4">${product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add to Cart
      </button>
    </div>
  );
}
