"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "/images/products/",
        isFeatured: false
    });

    // Check authentication and admin status
    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user.role !== 'admin') {
            router.push('/');
        }
    }, [session, status, router]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...product,
                    price: parseFloat(product.price)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            alert('Product added successfully!');
            // Reset form
            setProduct({
                name: "",
                description: "",
                price: "",
                category: "",
                image: "/images/products/",
                isFeatured: false
            });
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        }
    };

    // Show loading state
    if (status === 'loading') {
        return <div className="container mx-auto p-6">Loading...</div>;
    }

    // Show access denied message instead of redirecting
    if (!session || session.user.role !== 'admin') {
        return <div className="container mx-auto p-6">Access Denied</div>;
    }

    const categories = [
        'Pain Relief',
        'Cold & Flu Relief',
        'Allergy Relief',
        'Digestive Relief',
        'First Aid',
        'Vitamins',
        'Feminine Care',
        'Nasal Care',
        'Sleep Aid',
        'Joint Health Supplements',
        'Omega-3 Supplements',
        'Probiotics',
        'Cough & Throat Relief',
        'Sinus & Cold Relief',
        'Motion Sickness Relief',
        'OTC Medications'
    ];

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
                        rows={4}
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

                {/* Category */}
                <div className="mb-4">
                    <label className="block text-gray-700">Category</label>
                    <select
                        name="category"
                        value={product.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Image Path */}
                <div className="mb-4">
                    <label className="block text-gray-700">Image Path</label>
                    <input
                        type="text"
                        name="image"
                        value={product.image}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                        placeholder="/images/products/product-name.png"
                    />
                </div>

                {/* Featured Product */}
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={product.isFeatured}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <span className="text-gray-700">Featured Product</span>
                    </label>
                </div>

                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded mt-4 hover:bg-blue-700">
                    Add Product
                </button>
            </form>
        </div>
    );
}
