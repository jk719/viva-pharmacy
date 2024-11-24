"use client";

import { useState } from "react";

export default function AddProductForm() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newProduct = { name, description, price: parseFloat(price) };
        
        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct),
            });

            if (response.ok) {
                alert("Product added successfully!");
                setName("");
                setDescription("");
                setPrice("");
            } else {
                alert("Failed to add product.");
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-300 rounded shadow">
            <h2 className="text-xl font-bold">Add New Product</h2>
            <div>
                <label className="block text-gray-700">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-700">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                ></textarea>
            </div>
            <div>
                <label className="block text-gray-700">Price</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
                Add Product
            </button>
        </form>
    );
}
