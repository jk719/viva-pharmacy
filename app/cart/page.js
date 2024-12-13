"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, Suspense } from 'react';
import { FaStore, FaTruck } from 'react-icons/fa';

function CartContent() {
    const router = useRouter();
    const { 
        items = [], 
        updateQuantity, 
        removeFromCart,
        deliveryOption,
        setDeliveryOption,
    } = useCart();

    const subtotal = items?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0;
    const deliveryFee = deliveryOption === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        console.log('Checkout clicked');
        router.push('/checkout');
    };

    return (
        <div className="container mx-auto px-4 md:px-6">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-6 text-primary">Your Cart</h1>
                {!items?.length ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Your cart is empty</p>
                        <Link 
                            href="/" 
                            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div>
                        {items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row border-b py-4">
                                {/* Product Image */}
                                <div className="flex-shrink-0 w-24 h-24 relative mx-auto sm:mx-0">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex flex-col flex-grow ml-0 sm:ml-4 mt-4 sm:mt-0 text-center sm:text-left">
                                    <h2 className="font-semibold mb-2 truncate">{item.name}</h2>
                                    <p className="text-gray-600 mb-4">${item.price?.toFixed(2)}</p>
                                    
                                    {/* Quantity Controls and Remove Button in one line */}
                                    <div className="flex items-center justify-center sm:justify-start space-x-4">
                                        {/* Quantity Controls Group */}
                                        <div className="flex items-center bg-gray-100 rounded-full">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, (item.quantity || 0) - 1)}
                                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full"
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center text-lg">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, (item.quantity || 0) + 1)}
                                                className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                        
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Delivery Options */}
                        <div className="mt-6 delivery-options">
                            <h2 className="text-lg font-bold mb-2">Delivery Options</h2>
                            
                            <div className="flex space-x-6 mb-4">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="deliveryOption"
                                        value="pickup"
                                        checked={deliveryOption === 'pickup'}
                                        onChange={(e) => setDeliveryOption(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`flex items-center p-3 rounded-lg transition-all ${
                                        deliveryOption === 'pickup' 
                                            ? 'bg-[#289d44] text-white' 
                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                    }`}>
                                        <FaStore className="text-xl mr-2" />
                                        <span>Pickup</span>
                                    </div>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="deliveryOption"
                                        value="delivery"
                                        checked={deliveryOption === 'delivery'}
                                        onChange={(e) => setDeliveryOption(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`flex items-center p-3 rounded-lg transition-all ${
                                        deliveryOption === 'delivery' 
                                            ? 'bg-[#289d44] text-white' 
                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                    }`}>
                                        <FaTruck className="text-xl mr-2" />
                                        <span>Delivery</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 border-t pt-4">
                            <div className="flex justify-between mb-2">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {deliveryOption === 'delivery' && (
                                <div className="flex justify-between mb-2">
                                    <span>Delivery Fee:</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <Link 
                                href="/"
                                className="w-full sm:w-auto text-white px-6 py-2 rounded hover:opacity-90 transition-opacity text-center"
                                style={{ backgroundColor: '#003366' }}
                            >
                                Continue Shopping
                            </Link>
                            
                            <button
                                onClick={handleCheckout}
                                className="w-full sm:w-auto text-white px-6 py-2 rounded hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#003366' }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense 
            fallback={
                <div className="container mx-auto px-4 md:px-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-24 bg-gray-200 rounded"></div>
                                <div className="h-24 bg-gray-200 rounded"></div>
                                <div className="h-24 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <CartContent />
        </Suspense>
    );
}