// src/app/checkout/page.js
"use client";

import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export default function CheckoutPage() {
    const { cartItems } = useCart();
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [processingOrder, setProcessingOrder] = useState(false);

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        setProcessingOrder(true);

        // Simulate order processing (In a real app, you’d send order data to the server here)
        setTimeout(() => {
            alert("Order placed successfully!");
            setProcessingOrder(false);
        }, 2000);
    };

    return (
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            <form onSubmit={handleOrderSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Shipping Address</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <ul className="mb-6">
                    {cartItems.map((item) => (
                        <li key={item.id} className="mb-2">
                            {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                        </li>
                    ))}
                </ul>
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded"
                    disabled={processingOrder}
                >
                    {processingOrder ? "Processing..." : "Place Order"}
                </button>
            </form>
        </div>
    );
}
