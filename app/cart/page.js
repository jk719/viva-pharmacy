"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';

function CartContent() {
    const router = useRouter();
    const { 
        items = [], 
        updateQuantity, 
        removeFromCart,
    } = useCart();

    const subtotal = items?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0;
    const total = subtotal;

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        router.push('/checkout');
    };

    return (
        <div className="container mx-auto px-4 md:px-6">
            <motion.div 
                className="bg-white rounded-3xl border-2 border-gray-100 p-4 md:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Your Cart
                </h1>
                
                {!items?.length ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Your cart is empty</p>
                        <Link 
                            href="/" 
                            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium
                                hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div>
                        {items.map((item) => (
                            <motion.div 
                                key={item.id} 
                                className="flex flex-col sm:flex-row border-b border-gray-100 py-4"
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex-shrink-0 w-24 h-24 relative mx-auto sm:mx-0 rounded-2xl overflow-hidden bg-gray-50/50">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2 transition-transform duration-300 hover:scale-110"
                                    />
                                </div>
                                
                                <div className="flex flex-col flex-grow ml-0 sm:ml-4 mt-4 sm:mt-0 text-center sm:text-left">
                                    <h2 className="font-medium text-gray-900 mb-2 hover:text-primary transition-colors duration-200">
                                        {item.name}
                                    </h2>
                                    <p className="text-lg font-bold text-gray-900 mb-4">
                                        ${item.price?.toFixed(2)}
                                    </p>
                                    
                                    <div className="flex items-center justify-center sm:justify-start space-x-4">
                                        <div className="flex items-center bg-gray-50 rounded-xl p-1 transition-colors">
                                            <motion.button
                                                onClick={() => handleQuantityChange(item.id, (item.quantity || 0) - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 
                                                    hover:bg-white rounded-lg transition-all hover:shadow-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                -
                                            </motion.button>
                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                            <motion.button
                                                onClick={() => handleQuantityChange(item.id, (item.quantity || 0) + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 
                                                    hover:bg-white rounded-lg transition-all hover:shadow-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                +
                                            </motion.button>
                                        </div>
                                        
                                        <motion.button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Remove
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link 
                                href="/"
                                className="w-full sm:w-auto bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-medium
                                    hover:bg-gray-100 transition-all duration-200 text-center"
                            >
                                Continue Shopping
                            </Link>
                            
                            <motion.button
                                onClick={handleCheckout}
                                className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-medium
                                    hover:bg-primary/90 transition-all duration-200"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Proceed to Checkout
                            </motion.button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense 
            fallback={
                <div className="container mx-auto px-4 md:px-6">
                    <div className="bg-white rounded-3xl border-2 border-gray-100 p-4 md:p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-100 rounded-xl w-48"></div>
                            <div className="h-24 bg-gray-100 rounded-xl"></div>
                            <div className="h-24 bg-gray-100 rounded-xl"></div>
                            <div className="h-24 bg-gray-100 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            }
        >
            <CartContent />
        </Suspense>
    );
}