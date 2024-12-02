"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Create a context for the cart
const CartContext = createContext();

// Custom hook to use the cart context
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// CartProvider component to wrap around parts of the app that need access to the cart context
export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [selectedTime, setSelectedTime] = useState('');
    const [showTimeError, setShowTimeError] = useState(false);

    // Calculate total whenever items change
    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotal(newTotal);
    }, [items]);

    // Add item to cart
    const addToCart = (product) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    // Update item quantity
    const updateQuantity = (productId, quantity) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: Math.max(0, quantity) }
                    : item
            )
        );
    };

    return (
        <CartContext.Provider value={{
            items,
            total,
            addToCart,
            removeFromCart,
            updateQuantity,
            deliveryOption,
            setDeliveryOption,
            selectedTime,
            setSelectedTime,
            showTimeError,
            setShowTimeError
        }}>
            {children}
        </CartContext.Provider>
    );
}