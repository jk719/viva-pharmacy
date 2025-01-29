"use client";

import { useRouter } from "next/navigation";
import { mutate } from 'swr';
import toast from 'react-hot-toast';
import BaseProductForm from './BaseProductForm';
import { categories } from '@/data/categories';

export default function AddProductForm() {
    const router = useRouter();

    const REDIRECT_DELAY = 1500; // 1.5 seconds

    const handleSubmit = async (formData) => {
        try {
            // Show loading toast
            const loadingToast = toast.loading('Adding product...');

            // Find the category and item
            const category = categories.find(c => c.slug === formData.categorySlug);
            const item = category?.items.find(i => i.slug === formData.itemSlug);

            if (!category || !item) {
                toast.error('Invalid category selection');
                throw new Error('Invalid category selection');
            }

            // Transform the data
            const transformedData = {
                ...formData,
                category: category.name,
                subcategory: category.name, // Same as category
                item: item.name,
                categoryPath: `${category.name} > ${item.name}`,
                categoryTagline: category.tagline,
            };

            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transformedData),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success('Product added successfully!', {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        maxWidth: '90vw',
                        margin: '0 auto',
                    },
                });
                await mutate('/api/products');
                setTimeout(() => {
                    router.push('/admin');
                    router.refresh();
                }, REDIRECT_DELAY);
                return true;
            } else {
                toast.error(data.message || "Failed to add product");
                throw new Error(data.message || "Failed to add product");
            }
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error(error.message || 'Failed to add product', {
                duration: 4000,
                position: 'top-center',
                style: {
                    maxWidth: '90vw',
                    margin: '0 auto',
                },
            });
            throw error;
        }
    };

    return (
        <BaseProductForm
            onSubmit={handleSubmit}
            submitButtonText="Add Product"
            initialData={{
                name: '',
                description: '',
                price: '',
                categorySlug: '',
                subcategorySlug: '',
                itemSlug: '',
                image: '',
                isFeatured: false,
                stock: 0,
                dosageForm: '',
                activeIngredients: [{ name: "", amount: "" }],
                warnings: [""],
                directions: ''
            }}
            isEdit={false}
        />
    );
}
