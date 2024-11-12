// src/context/CartContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the cart
const CartContext = createContext();

// Custom hook to use the cart context
export function useCart() {
    return useContext(CartContext);
}

// CartProvider component to wrap around parts of the app that need access to the cart context
export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Load cart items from localStorage on initial render
    useEffect(() => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // Update localStorage whenever cartItems change
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Function to add items to the cart
    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
                );
            } else {
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
    };

    // Function to decrement item quantity or remove item if quantity is 0
    const decrement = (itemId) => {
        setCartItems((prevItems) => {
            return prevItems
                .map((item) =>
                    item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter((item) => item.quantity > 0); // Remove items with 0 quantity
        });
    };

    // Function to remove an item completely from the cart
    const removeFromCart = (itemId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, decrement, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}
