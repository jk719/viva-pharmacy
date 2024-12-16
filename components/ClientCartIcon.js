// src/components/ClientCartIcon.js
"use client";

import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi';

export default function ClientCartIcon() {
    const { items = [] } = useCart();
    const totalItems = items?.reduce((total, item) => 
        total + (Number(item?.quantity) || 0), 0
    ) || 0;

    return (
        <div className="relative inline-flex items-center justify-center">
            <button 
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors duration-200 group"
                aria-label={`Shopping cart with ${totalItems} items`}
            >
                <HiOutlineShoppingBag className="w-6 h-6 text-white transition-transform duration-200 group-hover:scale-110" />
                
                <AnimatePresence>
                    {totalItems > 0 && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="absolute -top-1 -right-1"
                        >
                            <div className="flex items-center justify-center">
                                <div className="absolute w-5 h-5 bg-[#FF9F43] rounded-full animate-ping opacity-75"></div>
                                <div className="relative flex items-center justify-center w-5 h-5 bg-[#FF9F43] text-white text-xs font-medium rounded-full">
                                    {totalItems}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
}
