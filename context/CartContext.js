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
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);

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

    // Calculate totals when items change
    useEffect(() => {
        if (!loading) {
            const newSubtotal = items.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );
            const newTax = newSubtotal * 0.08; // 8% tax rate
            const newTotal = newSubtotal + newTax;
            
            setSubtotal(newSubtotal);
            setTax(newTax);
            setTotal(newTotal);
            
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, loading]);

    const getProductId = useCallback((product) => {
        return product._id || product.id; // Support both MongoDB _id and legacy id
    }, []);

    const addToCart = useCallback((product) => {
        if (!product || (!product._id && !product.id)) {
            console.error('Invalid product:', product);
            return;
        }
        
        setItems(prevItems => {
            const productId = getProductId(product);
            const existingItem = prevItems.find(item => 
                getProductId(item) === productId
            );
            
            if (existingItem) {
                return prevItems.map(item =>
                    getProductId(item) === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            
            return [...prevItems, { 
                ...product, 
                quantity: 1,
                addedAt: new Date().toISOString() 
            }];
        });
    }, [getProductId]);

    const removeFromCart = useCallback((productId) => {
        setItems(prevItems => 
            prevItems.filter(item => getProductId(item) !== productId)
        );
    }, [getProductId]);

    const updateQuantity = useCallback((productId, quantity) => {
        const newQuantity = Math.max(0, parseInt(quantity));
        
        setItems(prevItems => {
            if (newQuantity === 0) {
                return prevItems.filter(item => getProductId(item) !== productId);
            }
            
            return prevItems.map(item =>
                getProductId(item) === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
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
        setSubtotal(0);
        setTax(0);
    }, []);

    const getCartSize = useCallback(() => {
        return items.reduce((total, item) => total + item.quantity, 0);
    }, [items]);

    const value = {
        items,
        total,
        subtotal,
        tax,
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
        setShowTimeError,
        getCartSize
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}