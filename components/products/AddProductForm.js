"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mutate } from 'swr';

export default function AddProductForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        isFeatured: false,
        stock: 0,
        dosageForm: "",
        activeIngredients: [{ name: "", amount: "" }],
        warnings: [""],
        directions: ""
    });
    const [error, setError] = useState("");

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

    const dosageForms = [
        "Tablet",
        "Capsule",
        "Liquid",
        "Cream",
        "Gel",
        "Spray",
        "Other"
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle active ingredients
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.activeIngredients];
        newIngredients[index] = {
            ...newIngredients[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            activeIngredients: newIngredients
        }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            activeIngredients: [...prev.activeIngredients, { name: "", amount: "" }]
        }));
    };

    const removeIngredient = (index) => {
        setFormData(prev => ({
            ...prev,
            activeIngredients: prev.activeIngredients.filter((_, i) => i !== index)
        }));
    };

    // Handle warnings
    const handleWarningChange = (index, value) => {
        const newWarnings = [...formData.warnings];
        newWarnings[index] = value;
        setFormData(prev => ({
            ...prev,
            warnings: newWarnings
        }));
    };

    const addWarning = () => {
        setFormData(prev => ({
            ...prev,
            warnings: [...prev.warnings, ""]
        }));
    };

    const removeWarning = (index) => {
        setFormData(prev => ({
            ...prev,
            warnings: prev.warnings.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            // Filter out empty ingredients and warnings
            const cleanedData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                activeIngredients: formData.activeIngredients.filter(i => i.name && i.amount),
                warnings: formData.warnings.filter(w => w.trim()),
                image: formData.image.trim() || "https://via.placeholder.com/400x400?text=No+Image"
            };
            
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();

            if (response.ok) {
                await mutate('/api/products');
                router.push('/admin');
            } else {
                setError(data.message || "Failed to add product");
            }
        } catch (error) {
            console.error("Error adding product:", error);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock *</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dosage Form *</label>
                        <select
                            name="dosageForm"
                            value={formData.dosageForm}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select form</option>
                            {dosageForms.map(form => (
                                <option key={form} value={form}>{form}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Active Ingredients */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Active Ingredients</h3>
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        + Add Ingredient
                    </button>
                </div>
                
                {formData.activeIngredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Ingredient name"
                                value={ingredient.name}
                                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Amount"
                                value={ingredient.amount}
                                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="mt-1 text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Warnings */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Warnings</h3>
                    <button
                        type="button"
                        onClick={addWarning}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        + Add Warning
                    </button>
                </div>
                
                {formData.warnings.map((warning, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <input
                            type="text"
                            value={warning}
                            onChange={(e) => handleWarningChange(index, e.target.value)}
                            className="flex-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter warning"
                        />
                        <button
                            type="button"
                            onClick={() => removeWarning(index)}
                            className="mt-1 text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Directions */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Directions for Use</label>
                <textarea
                    name="directions"
                    value={formData.directions}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {/* Image URL */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Image URL
                    <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                </label>
                <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter image URL"
                />
            </div>

            {/* Featured Toggle */}
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

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
                <Link
                    href="/admin"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Adding...' : 'Add Product'}
                </button>
            </div>
        </form>
    );
}
