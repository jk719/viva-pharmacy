"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
        productId: product._id || product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        imageUrl: product.imageUrl,
        cloudinaryPublicId: product.cloudinaryPublicId,
        quantity: product.quantity || 1
    };
};

// Add these constants at the top
const DELIVERY_FEES = {
  SAME_DAY: 0,
  TWO_HOUR: 5,
  ONE_HOUR: 7
};

// CartProvider component
export function CartProvider({ children }) {
    const [cartState, setCartState] = useState({
        items: [],
        total: 0,
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        loading: true,
        initialized: false
    });

    const [deliveryState, setDeliveryState] = useState({
        option: '',
        selectedTime: '',
        deliverySpeed: '',
        showTimeError: false
    });

    const [paymentStatus, setPaymentStatus] = useState({
        processing: false,
        paymentIntentId: null,
        error: null
    });

    // Add new state for loyalty redemption
    const [loyaltyState, setLoyaltyState] = useState({
        redemptionApplied: false,
        pointsRedeemed: 0,
        discountAmount: 0
    });

    // Memoize cart calculations
    const cartCalculations = useMemo(() => {
        if (!cartState.initialized || cartState.loading) return null;
        
        const subtotal = cartState.items.reduce(
            (sum, item) => sum + (item.price * item.quantity), 
            0
        );
        
        const deliveryFee = deliveryState.option === 'delivery' 
            ? DELIVERY_FEES[deliveryState.deliverySpeed]
            : 0;
        
        // Apply loyalty discount to subtotal
        const loyaltyDiscount = loyaltyState.redemptionApplied ? 10 : 0; // Fixed $10 discount
        const discountedSubtotal = Math.max(subtotal - loyaltyDiscount, 0);
        
        // Calculate tax on discounted amount
        const tax = (discountedSubtotal + deliveryFee) * 0.08875;
        
        const total = discountedSubtotal + deliveryFee + tax;
        
        return {
            subtotal,
            deliveryFee,
            tax,
            loyaltyDiscount,
            total
        };
    }, [cartState.items, cartState.initialized, cartState.loading, deliveryState.option, deliveryState.deliverySpeed, loyaltyState.redemptionApplied]);

    useEffect(() => {
        if (cartCalculations) {
            setCartState(prev => ({
                ...prev,
                ...cartCalculations
            }));
        }
    }, [cartCalculations]);

    // Load cart from localStorage on initial mount
    useEffect(() => {
        const loadCart = () => {
            try {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    // Validate cart data
                    const validCart = Array.isArray(parsedCart) ? parsedCart : [];
                    
                    setCartState(prev => ({
                        ...prev,
                        items: validCart,
                        loading: false,
                        initialized: true
                    }));
                } else {
                    setCartState(prev => ({
                        ...prev,
                        items: [],
                        loading: false,
                        initialized: true
                    }));
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartState(prev => ({ 
                    ...prev, 
                    items: [],
                    loading: false,
                    initialized: true
                }));
            }
        };

        // Remove the timeout and call loadCart directly
        loadCart();
    }, []);

    // Update localStorage when cart changes
    useEffect(() => {
        if (cartState.initialized && !cartState.loading) {
            localStorage.setItem('cart', JSON.stringify(cartState.items));
            
            const newSubtotal = cartState.items.reduce(
                (sum, item) => sum + (item.price * item.quantity), 
                0
            );

            // Calculate delivery fee based on delivery method and speed
            const deliveryFee = deliveryState.option === 'delivery' 
                ? DELIVERY_FEES[deliveryState.deliverySpeed]
                : 0;

            // Calculate tax on both subtotal AND delivery fee
            const newTax = (newSubtotal + deliveryFee) * 0.08875; // NYC tax rate
            
            setCartState(prev => ({
                ...prev,
                subtotal: newSubtotal,
                deliveryFee: deliveryFee,
                tax: newTax,
                total: newSubtotal + deliveryFee + newTax
            }));
        }
    }, [cartState.items, cartState.initialized, cartState.loading, deliveryState.option, deliveryState.deliverySpeed]);

    const getProductId = useCallback((product) => {
        return product.productId || product._id || product.id;
    }, []);

    const addToCart = useCallback(async (product) => {
        if (!product || (!product._id && !product.id)) {
            console.error('Invalid product:', product);
            return;
        }
        
        const productId = getProductId(product);
        
        setCartState(prevState => {
            // Check if item already exists
            const existingItem = prevState.items.find(item => 
                item.productId === productId
            );
            
            if (existingItem) {
                // Update quantity of existing item
                return {
                    ...prevState,
                    items: prevState.items.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }
            
            // Add new item
            const normalizedProduct = normalizeProduct(product);
            console.log('Adding new product to cart:', normalizedProduct);
            
            return {
                ...prevState,
                items: [...prevState.items, normalizedProduct]
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
            tax: 0,
            deliveryFee: 0
        }));
        
        // Reset delivery state
        setDeliveryState({
            option: '',
            selectedTime: '',
            deliverySpeed: '',
            showTimeError: false
        });
        
        // Reset payment status
        setPaymentStatus({
            processing: false,
            paymentIntentId: null,
            error: null
        });
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

    // Add the new updateItemQuantity function
    const updateItemQuantity = useCallback((productId, newQuantity) => {
        if (newQuantity < 0) return;
        
        setCartState(prevState => {
            const existingItemIndex = prevState.items.findIndex(
                item => getProductId(item) === productId
            );

            if (existingItemIndex === -1) {
                console.warn('Attempted to update quantity for non-existent item:', productId);
                return prevState;
            }

            const updatedItems = [...prevState.items];
            if (newQuantity === 0) {
                updatedItems.splice(existingItemIndex, 1);
            } else {
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: newQuantity
                };
            }

            return {
                ...prevState,
                items: updatedItems
            };
        });
    }, [getProductId]);

    // Add function to apply loyalty redemption
    const applyLoyaltyRedemption = useCallback(async (points = 100) => {
        try {
            const response = await fetch('/api/loyalty/points/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: points })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to redeem points');
            }

            // Convert points to dollars (10 points = $1)
            const discountAmount = parseFloat(data.discount);
            
            setLoyaltyState({
                redemptionApplied: true,
                pointsRedeemed: points,
                discountAmount: discountAmount
            });

            return { success: true, discount: discountAmount };
        } catch (error) {
            console.error('Error applying loyalty redemption:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // Add function to cancel loyalty redemption
    const cancelLoyaltyRedemption = useCallback(() => {
        setLoyaltyState({
            redemptionApplied: false,
            pointsRedeemed: 0,
            discountAmount: 0
        });
    }, []);

    const value = {
        items: cartState.items,
        total: cartState.total,
        subtotal: cartState.subtotal,
        tax: cartState.tax,
        deliveryFee: cartState.deliveryFee,
        loading: cartState.loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        decrement,
        updateItemQuantity,
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
        handlePaymentSuccess,
        deliverySpeed: deliveryState.deliverySpeed,
        setDeliverySpeed: (speed) => setDeliveryState(prev => ({ 
            ...prev, 
            deliverySpeed: speed,
            selectedTime: ''
        })),
        DELIVERY_FEES,
        loyaltyDiscount: loyaltyState.discountAmount,
        redemptionApplied: loyaltyState.redemptionApplied,
        pointsRedeemed: loyaltyState.pointsRedeemed,
        applyLoyaltyRedemption,
        cancelLoyaltyRedemption
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}