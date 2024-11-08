// src/app/cart/page.js
"use client"; // Ensures this page is treated as a client component

import { useCart } from '../../context/CartContext';
import Link from 'next/link';

export default function CartPage() {
    const { cartItems, removeFromCart } = useCart();

    return (
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                        <li key={item.id} className="flex justify-between items-center py-4">
                            <div>
                                <h2 className="text-lg font-bold">{item.name}</h2>
                                <p>Price: ${item.price.toFixed(2)}</p>
                                <p>Quantity: {item.quantity}</p>
                            </div>
                            <button
                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                                onClick={() => removeFromCart(item.id)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {cartItems.length > 0 && (
                <div className="mt-6 flex justify-end">
                    <Link href="/checkout">
                        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                            Proceed to Checkout
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
