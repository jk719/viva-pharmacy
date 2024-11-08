// src/context/CartContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Load cart items from localStorage on initial render
    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // Update localStorage whenever cartItems changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to cart with quantity adjustment
    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
                };
                return updatedItems;
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    // Remove item from cart by ID
    const removeFromCart = (itemId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}
