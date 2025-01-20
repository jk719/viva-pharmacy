"use client";

import { useRouter } from "next/navigation";
import { mutate } from 'swr';
import BaseProductForm from './BaseProductForm';

export default function AddProductForm() {
    const router = useRouter();

    const handleSubmit = async (formData) => {
        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                await mutate('/api/products');
                router.push('/admin');
                return true;
            } else {
                throw new Error(data.message || "Failed to add product");
            }
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    return (
        <BaseProductForm
            onSubmit={handleSubmit}
            submitButtonText="Add Product"
        />
    );
}
