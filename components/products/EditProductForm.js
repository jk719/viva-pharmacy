"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductForm({ productId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        isFeatured: false
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const categories = [
        "Pain Relief",
        "Cold & Flu Relief",
        "Digestive Health",
        "First Aid",
        "Feminine Care",
        "Vitamins",
        "Allergy Relief",
        "Sleep Aid",
        "Foot Care"
    ].sort();

    useEffect(() => {
        if (!productId) {
            setError("Product ID is required");
            setLoading(false);
            return;
        }
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setError("");
            const response = await fetch(`/api/products/${productId}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to load product");
            }
            
            if (data.success && data.product) {
                setFormData({
                    name: data.product.name || "",
                    description: data.product.description || "",
                    price: data.product.price?.toString() || "",
                    category: data.product.category || "",
                    image: data.product.image || "",
                    isFeatured: data.product.isFeatured || false
                });
            } else {
                throw new Error("Product data is invalid");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            setError(error.message || "Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        setError("");
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.description.trim()) return "Description is required";
        if (!formData.price || parseFloat(formData.price) <= 0) return "Valid price is required";
        if (!formData.category) return "Category is required";
        if (!formData.image.trim()) return "Image URL is required";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        setError("");
        setSuccessMessage("");
        
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price)
            };
            
            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccessMessage("Product updated successfully");
                setTimeout(() => router.push('/admin'), 1500);
            } else {
                throw new Error(data.message || "Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            setError(error.message || "An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                <Link 
                    href="/admin"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                    Back to Products
                </Link>
            </div>
            
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 border border-red-200">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4 border border-green-200">
                    {successMessage}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                        Featured Product
                    </label>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                                  transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </div>
        </form>
    );
} 