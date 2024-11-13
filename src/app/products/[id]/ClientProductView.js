// src/app/products/[id]/ClientProductView.js
"use client";

import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ClientProductView({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  // Function to handle the back button
  const handleBack = () => {
    router.back(); // Goes back to the previous page
  };

  // Optional error handling if `product` is missing
  if (!product) {
    return <p>Product details are not available.</p>;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full md:w-3/4 lg:w-2/3 rounded-lg shadow-lg relative overflow-y-auto p-6">
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          aria-label="Go back to previous page"
          style={{ backgroundColor: 'var(--primary-color)' }}
          className="absolute top-4 left-4 text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 font-semibold"
        >
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="flex-1 flex justify-center items-center mb-4 md:mb-0">
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain max-w-full max-h-[400px]"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 px-6">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center text-yellow-500 mb-4">
              <span className="text-sm">★★★★☆</span>
              <span className="text-sm text-gray-600 ml-2">(2415)</span>
            </div>

            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>

            <div className="flex items-center mb-4">
              {/* <select className="border border-gray-300 rounded px-2 py-1 mr-4">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select> */}
              <button
                onClick={() => addToCart(product)}
                aria-label={`Add ${product.name} to cart`}
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="text-white px-6 py-2 rounded hover:opacity-90 font-semibold"
              >
                Add to Cart
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 cursor-pointer text-gray-800">Details</h3>
              <h3 className="font-semibold mb-2 cursor-pointer text-gray-800">Ingredients</h3>
              <h3 className="font-semibold mb-2 cursor-pointer text-gray-800">Directions</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
