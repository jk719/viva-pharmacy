// src/app/checkout/page.js
"use client";

import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiClock, FiMapPin, FiTruck, FiHome, FiPhone } from 'react-icons/fi';

export default function CheckoutPage() {
    const { cartItems } = useCart();
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [processingOrder, setProcessingOrder] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        streetAddress: '',
        unit: '',
        city: '',
        province: '',
        postalCode: '',
        phone: '',
        deliveryInstructions: ''
    });
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes] = useState([
        '09:00 AM', '10:00 AM', '11:00 AM', 
        '12:00 PM', '01:00 PM', '02:00 PM', 
        '03:00 PM', '04:00 PM', '05:00 PM'
    ]);

    useEffect(() => {
        // Generate next 3 days
        const dates = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                })
            });
        }
        setAvailableDates(dates);
        if (dates.length > 0) {
            setSelectedDate(dates[0].value);
        }
    }, []);

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.13;
    };

    const calculateDeliveryFee = () => {
        return deliveryMethod === 'delivery' ? 5.00 : 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() + calculateDeliveryFee();
    };

    const handleDeliveryMethodChange = (method) => {
        setDeliveryMethod(method);
        if (method === 'delivery') {
            setShowAddressForm(true);
        } else {
            setShowAddressForm(false);
        }
    };

    const handleDeliveryInfoChange = (e) => {
        const { name, value } = e.target;
        setDeliveryInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateDeliveryInfo = () => {
        if (deliveryMethod === 'delivery') {
            return deliveryInfo.streetAddress && 
                   deliveryInfo.city && 
                   deliveryInfo.province && 
                   deliveryInfo.postalCode && 
                   deliveryInfo.phone;
        }
        return true;
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime) {
            alert("Please select a date and time");
            return;
        }
        if (deliveryMethod === 'delivery' && !validateDeliveryInfo()) {
            alert("Please fill in all required delivery information");
            return;
        }
        setProcessingOrder(true);

        // Simulate order processing
        setTimeout(() => {
            alert("Order placed successfully!");
            setProcessingOrder(false);
        }, 2000);
    };

    return (
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-primary">Secure Checkout</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Delivery/Pickup Options */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-primary">Choose Delivery Method</h2>
                    
                    <div className="space-y-4">
                        {/* Delivery Method Selection */}
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={() => handleDeliveryMethodChange('pickup')}
                                style={{ 
                                    backgroundColor: deliveryMethod === 'pickup' ? 'var(--button-green)' : '#003366',
                                    borderColor: deliveryMethod === 'pickup' ? 'var(--button-green)' : '#003366'
                                }}
                                className="flex-1 py-3 px-4 rounded-lg border transition-colors flex items-center justify-center space-x-2 text-white"
                            >
                                <FiMapPin />
                                <span>Pickup</span>
                            </button>
                            <button
                                onClick={() => handleDeliveryMethodChange('delivery')}
                                style={{ 
                                    backgroundColor: deliveryMethod === 'delivery' ? 'var(--button-green)' : '#003366',
                                    borderColor: deliveryMethod === 'delivery' ? 'var(--button-green)' : '#003366'
                                }}
                                className="flex-1 py-3 px-4 rounded-lg border transition-colors flex items-center justify-center space-x-2 text-white"
                            >
                                <FiTruck />
                                <span>Delivery (+$5.00)</span>
                            </button>
                        </div>

                        {/* Delivery Address Form */}
                        {showAddressForm && (
                            <div className="space-y-4 mt-6 border-t pt-6">
                                <h3 className="font-medium text-lg text-primary mb-4">Delivery Information</h3>
                                
                                <div className="relative">
                                    <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="streetAddress"
                                        value={deliveryInfo.streetAddress}
                                        onChange={handleDeliveryInfoChange}
                                        placeholder="Street Address *"
                                        className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <input
                                    type="text"
                                    name="unit"
                                    value={deliveryInfo.unit}
                                    onChange={handleDeliveryInfoChange}
                                    placeholder="Apartment/Unit (optional)"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="city"
                                        value={deliveryInfo.city}
                                        onChange={handleDeliveryInfoChange}
                                        placeholder="City *"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="province"
                                        value={deliveryInfo.province}
                                        onChange={handleDeliveryInfoChange}
                                        placeholder="Province *"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <input
                                    type="text"
                                    name="postalCode"
                                    value={deliveryInfo.postalCode}
                                    onChange={handleDeliveryInfoChange}
                                    placeholder="Postal Code *"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />

                                <div className="relative">
                                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={deliveryInfo.phone}
                                        onChange={handleDeliveryInfoChange}
                                        placeholder="Phone Number *"
                                        className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <textarea
                                    name="deliveryInstructions"
                                    value={deliveryInfo.deliveryInstructions}
                                    onChange={handleDeliveryInfoChange}
                                    placeholder="Delivery Instructions (optional)"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                                />
                            </div>
                        )}

                        {/* Date Selection */}
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">
                                Select Date
                            </label>
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                {availableDates.map((date) => (
                                    <option key={date.value} value={date.value}>
                                        {date.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Time Selection */}
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">
                                Select Time
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {availableTimes.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-2 text-sm border rounded-lg transition-colors ${
                                            selectedTime === time
                                                ? 'bg-green-600 text-white border-green-600'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-primary-color'
                                        }`}
                                        style={
                                            selectedTime === time 
                                                ? { 
                                                    backgroundColor: 'var(--button-green)',
                                                    borderColor: 'var(--button-green)',
                                                    color: 'white'
                                                  } 
                                                : {}
                                        }
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-primary">Order Summary</h2>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b">
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-16 h-16">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}

                        <div className="space-y-2 pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (13%)</span>
                                <span>${calculateTax().toFixed(2)}</span>
                            </div>
                            {deliveryMethod === 'delivery' && (
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span>${calculateDeliveryFee().toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        {selectedDate && selectedTime && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <FiClock />
                                    <span>
                                        {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'} on{' '}
                                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })} at {selectedTime}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleOrderSubmit}
                            className="w-full mt-6 py-3 px-4 rounded-lg text-white font-medium transition-colors"
                            style={{ backgroundColor: 'var(--primary-color)' }}
                            disabled={processingOrder || !selectedDate || !selectedTime}
                        >
                            {processingOrder ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
