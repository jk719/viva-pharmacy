// src/components/ClientCartIcon.js
"use client";

import { useCart } from '../context/CartContext';

export default function ClientCartIcon() {
    const { items = [] } = useCart();
    const totalItems = items?.reduce((total, item) => 
        total + (Number(item?.quantity) || 0), 0
    ) || 0;

    return (
        <div className="relative flex items-center">
            <span 
                role="img" 
                aria-label="cart" 
                className="text-2xl"
            >
                🛒
            </span>
            {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {totalItems}
                </span>
            )}
        </div>
    );
}
