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

// Add these helper functions at the top
const normalizeProduct = (product) => {
    if (!product) return null;
    return {
        id: product._id || product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: product.quantity || 1
    };
};

// CartProvider component
export function CartProvider({ children }) {
    const [cartState, setCartState] = useState({
        items: [],
        total: 0,
        subtotal: 0,
        tax: 0,
        loading: true
    });

    const [deliveryState, setDeliveryState] = useState({
        option: 'pickup',
        selectedTime: '',
        showTimeError: false
    });

    const [paymentStatus, setPaymentStatus] = useState({
        processing: false,
        paymentIntentId: null,
        error: null
    });

    // Load cart from localStorage on initial mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setCartState(prev => ({
                    ...prev,
                    items: parsedCart,
                    loading: false
                }));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    // Calculate totals when items change
    useEffect(() => {
        if (!cartState.loading) {
            const newSubtotal = cartState.items.reduce(
                (sum, item) => sum + (item.price * item.quantity), 
                0
            );
            const newTax = newSubtotal * 0.08;
            
            setCartState(prev => ({
                ...prev,
                subtotal: newSubtotal,
                tax: newTax,
                total: newSubtotal + newTax
            }));
            
            localStorage.setItem('cart', JSON.stringify(cartState.items));
        }
    }, [cartState.items, cartState.loading]);

    const getProductId = useCallback((product) => {
        return product._id || product.id; // Support both MongoDB _id and legacy id
    }, []);

    const addToCart = useCallback((product) => {
        if (!product || (!product._id && !product.id)) {
            console.error('Invalid product:', product);
            return;
        }
        
        setCartState(prevItems => {
            const productId = getProductId(product);
            const existingItem = prevItems.items.find(item => 
                getProductId(item) === productId
            );
            
            if (existingItem) {
                return {
                    ...prevItems,
                    items: prevItems.items.map(item =>
                        getProductId(item) === productId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }
            
            // Normalize product data when adding to cart
            const normalizedProduct = normalizeProduct(product);
            console.log('Adding normalized product to cart:', normalizedProduct);
            
            return {
                ...prevItems,
                items: [...prevItems.items, { 
                    ...normalizedProduct,
                    addedAt: new Date().toISOString() 
                }]
            };
        });
    }, [getProductId]);

    const removeFromCart = useCallback((productId) => {
        setCartState(prevItems => ({
            ...prevItems,
            items: prevItems.items.filter(item => getProductId(item) !== productId)
        }));
    }, [getProductId]);

    const updateQuantity = useCallback((productId, quantity) => {
        const newQuantity = Math.max(0, parseInt(quantity));
        
        setCartState(prevItems => ({
            ...prevItems,
            items: prevItems.items.map(item =>
                getProductId(item) === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        }));
    }, [getProductId]);

    const decrement = useCallback((productId) => {
        setCartState(prevItems => ({
            ...prevItems,
            items: prevItems.items.map(item =>
                getProductId(item) === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        }));
    }, [getProductId]);

    const clearCart = useCallback(() => {
        localStorage.removeItem('cart');
        setCartState(prev => ({
            ...prev,
            items: [],
            total: 0,
            subtotal: 0,
            tax: 0
        }));
    }, []);

    const getCartSize = useCallback(() => {
        return cartState.items.reduce((total, item) => total + item.quantity, 0);
    }, [cartState.items]);

    // Add a method to get formatted cart items
    const getFormattedItems = useCallback(() => {
        return cartState.items.map(item => ({
            id: getProductId(item),
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            image: item.image,
            subtotal: parseFloat(item.price) * parseInt(item.quantity)
        }));
    }, [cartState.items, getProductId]);

    const startPaymentProcessing = useCallback((paymentIntentId) => {
        setPaymentStatus({
            processing: true,
            paymentIntentId,
            error: null
        });
    }, []);

    const completePaymentProcessing = useCallback(() => {
        setPaymentStatus({
            processing: false,
            paymentIntentId: null,
            error: null
        });
        clearCart();
    }, []);

    const handlePaymentError = useCallback((error) => {
        setPaymentStatus({
            processing: false,
            paymentIntentId: null,
            error
        });
    }, []);

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            console.log('🎉 Payment successful, processing...');
            
            // Add a small delay to ensure webhook has processed
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Clear cart
            setCartState(prev => ({
                ...prev,
                items: [],
                total: 0,
                subtotal: 0,
                tax: 0
            }));
            localStorage.removeItem('cart');
            
            console.log('✅ Cart cleared successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Error in handlePaymentSuccess:', error);
            throw error;
        }
    };

    const value = {
        items: cartState.items,
        total: cartState.total,
        subtotal: cartState.subtotal,
        tax: cartState.tax,
        loading: cartState.loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        decrement,
        deliveryOption: deliveryState.option,
        setDeliveryOption: (option) => setDeliveryState(prev => ({ ...prev, option })),
        selectedTime: deliveryState.selectedTime,
        setSelectedTime: (time) => setDeliveryState(prev => ({ ...prev, selectedTime: time })),
        showTimeError: deliveryState.showTimeError,
        setShowTimeError: (error) => setDeliveryState(prev => ({ ...prev, showTimeError: error })),
        getCartSize,
        getFormattedItems,
        paymentStatus,
        startPaymentProcessing,
        completePaymentProcessing,
        handlePaymentError,
        handlePaymentSuccess
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}