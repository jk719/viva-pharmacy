"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useEffect, Suspense } from 'react';
import { FaShoppingBag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMinusSm, HiPlusSm, HiOutlineTrash } from 'react-icons/hi';

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
        <div className="container mx-auto px-4 md:px-6 py-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
            >
                <h1 className="text-2xl font-bold mb-8 text-primary flex items-center gap-3">
                    <FaShoppingBag className="text-xl" />
                    Your Cart
                </h1>

                {!items?.length ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="mb-6">
                            <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-6">Your cart is empty</p>
                        </div>
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 
                                     rounded-full hover:bg-primary/90 transition-all duration-300
                                     shadow-lg hover:shadow-xl"
                        >
                            Continue Shopping
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col sm:flex-row items-center gap-4 
                                             bg-gray-50 rounded-xl p-4 relative group"
                                >
                                    {/* Product Image */}
                                    <div className="w-24 h-24 relative bg-white rounded-lg p-2
                                                  shadow-sm group-hover:shadow-md transition-shadow">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    
                                    {/* Product Details */}
                                    <div className="flex-grow space-y-2 text-center sm:text-left">
                                        <h2 className="font-medium text-gray-800">{item.name}</h2>
                                        <p className="text-primary font-semibold">
                                            ${item.price?.toFixed(2)}
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center bg-white rounded-full shadow-sm">
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleQuantityChange(item.id, (item.quantity || 0) - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-red-500 
                                                             hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <HiMinusSm className="text-lg" />
                                                </motion.button>
                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleQuantityChange(item.id, (item.quantity || 0) + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-green-500 
                                                             hover:bg-green-50 rounded-full transition-colors"
                                                >
                                                    <HiPlusSm className="text-lg" />
                                                </motion.button>
                                            </div>
                                            
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => removeFromCart(item.id)}
                                                className="flex items-center gap-1 text-red-500 px-3 py-1.5 
                                                         rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <HiOutlineTrash />
                                                <span>Remove</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Order Summary */}
                        <div className="mt-8 space-y-3 border-t pt-6">
                            <div className="flex justify-between text-xl font-bold text-primary">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/"
                                className="flex-1 text-center bg-gray-100 text-gray-700 px-6 py-3 
                                         rounded-full hover:bg-gray-200 transition-colors duration-300"
                            >
                                Continue Shopping
                            </Link>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                className="flex-1 bg-primary text-white px-6 py-3 rounded-full 
                                         hover:bg-primary/90 transition-colors duration-300
                                         shadow-lg hover:shadow-xl"
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