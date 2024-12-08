"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { FaStore, FaTruck, FaClock } from 'react-icons/fa';

function CartContent() {
    const router = useRouter();
    const { 
        items = [], 
        updateQuantity, 
        removeFromCart,
        deliveryOption,
        setDeliveryOption,
        selectedTime,
        setSelectedTime,
    } = useCart();

    const [errorState, setErrorState] = useState({
        show: false,
        message: ''
    });

    const [showAllTimes, setShowAllTimes] = useState(false);
    const initialTimeDisplay = 8; // Number of time slots to show initially

    const timeSlots = useMemo(() => {
        const slots = [];
        const start = 9 * 60 + 30;
        const end = 19 * 60 + 55;
        const interval = deliveryOption === 'pickup' ? 15 : 60;

        for (let mins = start; mins <= end; mins += interval) {
            const hours = Math.floor(mins / 60);
            const minutes = mins % 60;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours > 12 ? hours - 12 : hours;
            const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            slots.push(timeString);
        }
        return slots;
    }, [deliveryOption]);

    const subtotal = items?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0) || 0;
    const deliveryFee = deliveryOption === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        console.log('Checkout clicked');

        if (!selectedTime) {
            setErrorState({
                show: true,
                message: `Please select your preferred ${deliveryOption === 'pickup' ? 'pickup' : 'delivery'} time`
            });
            
            // Log the error state
            console.log('Error state updated:', {
                show: true,
                message: `Please select your preferred ${deliveryOption === 'pickup' ? 'pickup' : 'delivery'} time`
            });
            
            return;
        }

        setErrorState({ show: false, message: '' });
        router.push('/checkout');
    };

    // Monitor error state changes
    useEffect(() => {
        console.log('Error state changed:', errorState);
    }, [errorState]);

    return (
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
            {!items?.length ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <Link href="/" className="text-blue-500 hover:text-blue-600">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div>
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row border-b py-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-24 h-24 relative mx-auto sm:mx-0">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex flex-col flex-grow ml-0 sm:ml-4 mt-4 sm:mt-0 text-center sm:text-left">
                                <h2 className="font-semibold mb-2 truncate">{item.name}</h2>
                                <p className="text-gray-600 mb-4">${item.price?.toFixed(2)}</p>
                                
                                {/* Quantity Controls and Remove Button in one line */}
                                <div className="flex items-center justify-center sm:justify-start space-x-4">
                                    {/* Quantity Controls Group */}
                                    <div className="flex items-center bg-gray-100 rounded-full">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, (item.quantity || 0) - 1)}
                                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full"
                                            aria-label="Decrease quantity"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center text-lg">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, (item.quantity || 0) + 1)}
                                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full"
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Delivery Options with Error Message */}
                    <div className="mt-6 delivery-options">
                        <h2 className="text-lg font-bold mb-2">Delivery Options</h2>
                        
                        <div className="flex space-x-6 mb-4">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="pickup"
                                    checked={deliveryOption === 'pickup'}
                                    onChange={(e) => {
                                        setDeliveryOption(e.target.value);
                                        setSelectedTime('');
                                    }}
                                    className="hidden"
                                />
                                <div className={`flex items-center p-3 rounded-lg transition-all ${
                                    deliveryOption === 'pickup' 
                                        ? 'bg-[#289d44] text-white' 
                                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}>
                                    <FaStore className="text-xl mr-2" />
                                    <span>Pickup</span>
                                </div>
                            </label>
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="delivery"
                                    checked={deliveryOption === 'delivery'}
                                    onChange={(e) => {
                                        setDeliveryOption(e.target.value);
                                        setSelectedTime('');
                                    }}
                                    className="hidden"
                                />
                                <div className={`flex items-center p-3 rounded-lg transition-all ${
                                    deliveryOption === 'delivery' 
                                        ? 'bg-[#289d44] text-white' 
                                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}>
                                    <FaTruck className="text-xl mr-2" />
                                    <span>Delivery</span>
                                </div>
                            </label>
                        </div>

                        {/* Time Slots */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Select Time:</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {timeSlots
                                    .slice(0, showAllTimes ? timeSlots.length : initialTimeDisplay)
                                    .map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => {
                                                setSelectedTime(time);
                                                setErrorState({ show: false, message: '' });
                                            }}
                                            className={`p-2 rounded-lg transition-colors ${
                                                selectedTime === time 
                                                    ? 'bg-[#289d44] text-white' 
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                ))}
                            </div>
                            
                            {timeSlots.length > initialTimeDisplay && (
                                <button
                                    onClick={() => setShowAllTimes(!showAllTimes)}
                                    className="mt-3 text-[#289d44] hover:text-[#1e7433] flex items-center justify-center w-full py-2 border border-[#289d44] rounded-lg"
                                >
                                    {showAllTimes ? (
                                        <span>Show Less Times</span>
                                    ) : (
                                        <span>View More Times ({timeSlots.length - initialTimeDisplay} available)</span>
                                    )}
                                </button>
                            )}
                            
                            {/* Error message */}
                            {errorState.show && (
                                <p className="text-red-500 text-sm mt-2">
                                    ⚠️ {errorState.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between mb-2">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {deliveryOption === 'delivery' && (
                            <div className="flex justify-between mb-2">
                                <span>Delivery Fee:</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <Link 
                            href="/"
                            className="w-full sm:w-auto text-white px-6 py-2 rounded hover:opacity-90 transition-opacity text-center"
                            style={{ backgroundColor: '#003366' }}
                        >
                            Continue Shopping
                        </Link>
                        
                        <button
                            onClick={handleCheckout}
                            className="w-full sm:w-auto text-white px-6 py-2 rounded hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#003366' }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense 
            fallback={
                <div className="container mx-auto p-6 bg-white min-h-screen">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            }
        >
            <CartContent />
        </Suspense>
    );
}