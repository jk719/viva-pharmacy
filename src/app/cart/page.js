"use client";

import { useCart } from '../../context/CartContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import AuthButtons from '../../components/AuthButtons';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const { data: session } = useSession();
    const [showAuth, setShowAuth] = useState(false);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCleanImagePath = (imagePath) => {
        return imagePath.replace('images/products/', '');
    };

    const handleCheckoutClick = (e) => {
        if (!session) {
            e.preventDefault();
            setShowAuth(true);
            // Scroll to auth section smoothly
            setTimeout(() => {
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
            {cartItems.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <Link href="/products" className="text-blue-500 hover:text-blue-600">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div>
                    <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item.id} className="flex items-center py-4 space-x-4">
                                <div className="w-24 h-24 relative flex-shrink-0">
                                    <Image
                                        src={`/images/products/${getCleanImagePath(item.image)}`}
                                        alt={item.name}
                                        width={96}
                                        height={96}
                                        className="object-contain"
                                        priority
                                    />
                                </div>

                                <div className="flex-grow">
                                    <h2 className="text-lg font-bold">{item.name}</h2>
                                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                                    
                                    <div className="flex items-center space-x-2 mt-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end">
                                    <p className="font-bold">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition-colors"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold">Total:</span>
                            <span className="text-lg font-bold">
                                ${calculateTotal().toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-end">
                            {session ? (
                                <Link href="/checkout">
                                    <button 
                                        className="text-white py-2 px-6 rounded transition-colors hover:bg-opacity-90"
                                        style={{ backgroundColor: '#003366' }}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </Link>
                            ) : (
                                <button 
                                    onClick={handleCheckoutClick}
                                    className="text-white py-2 px-6 rounded transition-colors hover:bg-opacity-90"
                                    style={{ backgroundColor: '#003366' }}
                                >
                                    Proceed to Checkout
                                </button>
                            )}
                        </div>
                    </div>

                    {showAuth && !session && (
                        <div 
                            id="auth-section"
                            className="mt-8 border-t pt-8"
                        >
                            <div className="max-w-md mx-auto">
                                <h2 className="text-xl font-semibold mb-4 text-center">
                                    Please Sign In to Continue
                                </h2>
                                <p className="text-gray-600 mb-6 text-center">
                                    Sign in to your account or create a new one to complete your purchase
                                </p>
                                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                    <AuthButtons />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}