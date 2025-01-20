"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/lib/api';
import { mutate } from 'swr';
import BaseProductForm from './BaseProductForm';

export default function EditProductForm({ productId }) {
    const router = useRouter();
    const { product, isLoading, isError } = useProduct(productId);
    const [successMessage, setSuccessMessage] = useState("");

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 bg-red-50 text-red-500 rounded-lg">
                Error loading product. Please try again later.
            </div>
        );
    }

    const handleSubmit = async (formData) => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await mutate('/api/products');
                await mutate(`/api/products/${productId}`);
                setSuccessMessage("Product updated successfully");
                setTimeout(() => router.push('/admin'), 1500);
                return true;
            } else {
                throw new Error(data.message || "Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    return (
        <BaseProductForm
            initialData={product}
            onSubmit={handleSubmit}
            submitButtonText="Update Product"
            isEdit={true}
        />
    );
} 