"use client";

import { useCart } from '../../context/CartContext';
import { useState } from 'react';

export default function Checkout() {
  const { cartItems } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder for Klover API integration
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded">
        <div className="mb-4">
          <label htmlFor="name" className="block text-lg font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-lg font-medium">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block text-lg font-medium">Address</label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded"
            required
          />
        </div>

        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <ul>
          {cartItems.map((item) => (
            <li key={item.id} className="mb-2">
              {item.name} x {item.quantity} - ${item.price * item.quantity}
            </li>
          ))}
        </ul>

        {/* Checkout Button */}
        <button type="submit" className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
          Proceed to Payment
        </button>
      </form>
    </div>
  );
}
