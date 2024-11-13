// src/app/products/[id]/ClientProductView.js
"use client";

import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ClientProductView({ product }) {
  const { addToCart, decrement, cartItems } = useCart();
  const router = useRouter();

  // Function to handle the back button
  const handleBack = () => {
    router.back();
  };

  // Retrieve the current quantity of the product in the cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const quantity = getItemQuantity(product.id);

  // Optional error handling if `product` is missing
  if (!product) {
    return <p>Product details are not available.</p>;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xs sm:max-w-md md:max-w-3/4 lg:max-w-2/3 rounded-lg shadow-lg relative overflow-y-auto p-4 md:p-6">
        
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
              width={200} // Mobile width
              height={200} // Mobile height
              className="object-contain max-w-full max-h-[300px] md:max-h-[400px] lg:max-h-[500px]"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 px-4 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center text-yellow-500 mb-2 md:mb-4">
              <span className="text-sm">★★★★☆</span>
              <span className="text-sm text-gray-600 ml-2">(2415)</span>
            </div>

            <p className="text-xl md:text-2xl font-bold mb-2 md:mb-4">${product.price.toFixed(2)}</p>

            {/* Add to Cart Button */}
            <div className="quantity-controls mb-2" role="group" aria-label="Quantity controls">
              {quantity === 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className="add-button inactive"
                  aria-label="Add to cart"
                >
                  Add +
                </button>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => decrement(product.id)}
                    className="quantity-button"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className={`add-button ${quantity > 0 ? 'active' : 'inactive'}`}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-2 md:pt-4">
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
