// src/components/ClientCartIcon.js
"use client";

import { useCart } from '../context/CartContext';
import { HiOutlineShoppingBag } from 'react-icons/hi';

export default function ClientCartIcon() {
    const { items = [] } = useCart();
    const totalItems = items?.reduce((total, item) => 
        total + (Number(item?.quantity) || 0), 0
    ) || 0;

    return (
        <div className="relative flex items-center group">
            <div className="p-2.5 rounded-full transition-all duration-300 
                          hover:bg-white/10 active:bg-white/20
                          group-hover:scale-110 transform cursor-pointer
                          relative overflow-hidden">
                {/* Shopping Bag Icon */}
                <HiOutlineShoppingBag 
                    className="w-6 h-6 text-white transition-all duration-300
                             group-hover:rotate-12 group-hover:scale-110
                             relative z-10" 
                    aria-label="Shopping Cart"
                />
                
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5
                              transition-all duration-300
                              before:absolute before:inset-0 before:bg-white/10
                              before:translate-y-full group-hover:before:translate-y-0
                              before:transition-transform before:duration-300
                              after:absolute after:inset-0 after:bg-white/5
                              after:-translate-y-full group-hover:after:translate-y-0
                              after:transition-transform after:duration-300" />
            </div>
            
            {totalItems > 0 && (
                <div className="absolute -top-1 -right-1 transform transition-all duration-300
                              group-hover:scale-110 group-hover:translate-x-0.5 
                              group-hover:-translate-y-0.5">
                    <div className="relative">
                        {/* Counter badge with bounce */}
                        <div className="bg-gradient-to-br from-orange-400 to-orange-500 
                                      text-white text-xs font-medium
                                      w-5 h-5 flex items-center justify-center rounded-full
                                      border-2 border-white shadow-lg
                                      animate-bounce-subtle hover:scale-110
                                      transition-transform duration-200">
                            {totalItems}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
