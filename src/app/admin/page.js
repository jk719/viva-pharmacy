"use client";

import { useState } from 'react';

export default function AdminPage() {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        sku: "",
        category: "",
        stock: "",
        imageUrl: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log("Product added:", product);
        // Reset form fields after submission
        setProduct({ name: "", description: "", price: "", sku: "", category: "", stock: "", imageUrl: "" });
    };

    return (
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard - Add Product</h1>
            <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded shadow-md">
                {/* Product Name */}
                <div className="mb-4">
                    <label className="block text-gray-700">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                {/* Price */}
                <div className="mb-4">
                    <label className="block text-gray-700">Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                        min="0.01"
                        step="0.01"
                    />
                </div>

                {/* SKU */}
                <div className="mb-4">
                    <label className="block text-gray-700">SKU</label>
                    <input
                        type="text"
                        name="sku"
                        value={product.sku}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                {/* Category */}
                <div className="mb-4">
                    <label className="block text-gray-700">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={product.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                {/* Stock Quantity */}
                <div className="mb-4">
                    <label className="block text-gray-700">Stock Quantity</label>
                    <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                        min="0"
                    />
                </div>

                {/* Image URL */}
                <div className="mb-4">
                    <label className="block text-gray-700">Image URL</label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={product.imageUrl}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                        placeholder="Enter the direct URL of the product image"
                    />
                </div>

                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded mt-4">
                    Add Product
                </button>
            </form>
        </div>
    );
}
