"use client";  // Marking this as a Client Component

import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { cartItems, removeFromCart } = useCart();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 gap-6">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="bg-white p-6 shadow rounded">
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-gray-700">Price: ${item.price}</p>
              <p className="text-gray-700">Quantity: {item.quantity}</p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Your cart is empty</p>
        )}
      </div>
    </div>
  );
}
