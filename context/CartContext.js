"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    const [loading, setLoading] = useState(true);
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [selectedTime, setSelectedTime] = useState('');
    const [showTimeError, setShowTimeError] = useState(false);

    // Load cart from localStorage on initial mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setItems(parsedCart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update total and save to localStorage when items change
    useEffect(() => {
        if (!loading) {
            const newTotal = items.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );
            setTotal(newTotal);
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, loading]);

    const getProductId = useCallback((product) => {
        return product.id;
    }, []);

    const addToCart = useCallback((product) => {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            return;
        }
        
        console.log('Adding product:', product);
        setItems(prevItems => {
            const productId = getProductId(product);
            console.log('Product ID:', productId);
            
            const existingItem = prevItems.find(item => 
                getProductId(item) === productId
            );
            
            if (existingItem) {
                console.log('Found existing item:', existingItem);
                return prevItems.map(item =>
                    getProductId(item) === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            
            console.log('Adding new item to cart');
            return [...prevItems, { ...product, quantity: 1 }];
        });
    }, [getProductId]);

    const removeFromCart = useCallback((productId) => {
        setItems(prevItems => 
            prevItems.filter(item => getProductId(item) !== productId)
        );
    }, [getProductId]);

    const updateQuantity = useCallback((productId, quantity) => {
        setItems(prevItems =>
            prevItems.map(item =>
                getProductId(item) === productId
                    ? { ...item, quantity: Math.max(0, parseInt(quantity)) }
                    : item
            )
        );
    }, [getProductId]);

    const decrement = useCallback((productId) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => getProductId(item) === productId);
            
            if (existingItem) {
                if (existingItem.quantity === 1) {
                    return prevItems.filter(item => getProductId(item) !== productId);
                }
                
                return prevItems.map(item =>
                    getProductId(item) === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            
            return prevItems;
        });
    }, [getProductId]);

    const clearCart = useCallback(() => {
        localStorage.removeItem('cart');
        setItems([]);
        setTotal(0);
    }, []);

    const value = {
        items,
        total,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        decrement,
        deliveryOption,
        setDeliveryOption,
        selectedTime,
        setSelectedTime,
        showTimeError,
        setShowTimeError
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}