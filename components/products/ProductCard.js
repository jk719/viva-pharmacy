"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product);
    setIsAdding(false);
  };

  return (
    <div className="relative group bg-white">
      {product.isNew && (
        <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs z-10">
          New
        </span>
      )}
      {!product.isInStock && (
        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs z-10">
          Out of Stock
        </span>
      )}
      <Link href={`/products/${product._id}`}>
        <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
          {product.categoryTagline && (
            <div className="mb-3 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium inline-block">
              {product.categoryTagline}
            </div>
          )}
          <div className="relative w-full h-48 mb-4">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{product.categoryPath}</p>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
                className={`
                  px-4 py-2 rounded text-sm font-medium
                  ${isAdding ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark'}
                  ${!product.isInStock ? 'bg-gray-300 cursor-not-allowed' : 'text-white'}
                  transition-colors duration-200
                `}
                disabled={!product.isInStock || isAdding}
              >
                {isAdding ? 'Adding...' : product.isInStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
            {product.activeIngredients?.length > 0 && (
              <div className="text-sm text-gray-600">
                <p className="font-medium">Active Ingredients:</p>
                <ul className="list-disc list-inside">
                  {product.activeIngredients.slice(0, 2).map((ingredient, index) => (
                    <li key={index} className="truncate">
                      {ingredient.name}: {ingredient.amount}
                    </li>
                  ))}
                  {product.activeIngredients.length > 2 && (
                    <li className="text-primary cursor-pointer">+ more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
} 