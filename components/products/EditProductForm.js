"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import BaseProductForm from './BaseProductForm';
import { categories } from '@/data/categories';

// Helper function to find valid slugs
const findValidSlugs = (category, subcategory, item, productName) => {
    console.log('Finding valid slugs for:', { category, subcategory, item, productName });
    
    // Find the category
    const categoryObj = categories.find(c => 
        c.slug === category || 
        c.name === category ||
        c.name.toLowerCase() === category?.toLowerCase()
    );
    
    if (!categoryObj) {
        console.error('Category not found:', category);
        return null;
    }

    // Find the subcategory
    const subcategoryObj = categoryObj.subcategories.find(s => 
        s.slug === subcategory || 
        s.name === subcategory ||
        s.name.toLowerCase() === subcategory?.toLowerCase()
    );
    
    if (!subcategoryObj) {
        console.error('Subcategory not found:', subcategory);
        return null;
    }

    // Find the item
    const itemObj = subcategoryObj.items.find(i => 
        i.slug === item || 
        i.name === item ||
        i.name.toLowerCase() === item?.toLowerCase()
    );
    
    if (!itemObj) {
        console.error('Item not found:', item);
        return null;
    }

    return {
        categorySlug: categoryObj.slug,
        subcategorySlug: subcategoryObj.slug,
        itemSlug: itemObj.slug
    };
};

export default function EditProductForm({ product }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (product) {
            try {
                // Get valid slugs based on the product's categories
                const validSlugs = findValidSlugs(
                    product.category || product.categorySlug,
                    product.subcategory || product.subcategorySlug,
                    product.item || product.itemSlug,
                    product.name
                );

                if (!validSlugs) {
                    console.error('Could not determine valid category slugs');
                    return;
                }

                // Transform the product data to match the form structure
                const transformedData = {
                    ...product,
                    ...validSlugs, // Spread the valid slugs
                    // Ensure other required fields are present
                    activeIngredients: product.activeIngredients || [],
                    warnings: product.warnings || [],
                    contraindications: product.contraindications || [],
                    sideEffects: product.sideEffects || [],
                    stock: product.stock || 0,
                    isPopular: product.isPopular || false,
                    isNewProduct: product.isNewProduct || false,
                    isFeatured: product.isFeatured || false,
                };
                
                console.log('Setting initial data:', transformedData);
                setInitialData(transformedData);
            } catch (error) {
                console.error('Error transforming product data:', error);
            }
        }
    }, [product]);

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setErrorMessage("");
            
            console.log('Form data before validation:', formData);
            
            // Get valid slugs for the submission
            const validSlugs = findValidSlugs(
                formData.category,
                formData.subcategory,
                formData.item,
                formData.name
            );

            console.log('Generated valid slugs:', validSlugs);

            // Find the actual category data
            const category = categories.find(c => c.slug === validSlugs.categorySlug);
            const subcategory = category?.subcategories.find(s => s.slug === validSlugs.subcategorySlug);
            const item = subcategory?.items.find(i => i.slug === validSlugs.itemSlug);

            if (!category || !subcategory || !item) {
                throw new Error('Invalid category hierarchy');
            }

            // Clean up the form data with actual category names
            const cleanedData = {
                ...formData,
                categorySlug: validSlugs.categorySlug,
                subcategorySlug: validSlugs.subcategorySlug,
                itemSlug: validSlugs.itemSlug,
                category: category.name,
                subcategory: subcategory.name,
                item: item.name,
                categoryPath: `${category.name} > ${subcategory.name} > ${item.name}`
            };

            console.log('Submitting update for product:', product._id);
            console.log('Cleaned form data:', cleanedData);

            const response = await fetch(`/api/products/${product._id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                throw new Error(data.message || `Server error: ${response.status}`);
            }

            if (data.success) {
                await mutate('/api/products');
                await mutate(`/api/products/${product._id}`);
                setSuccessMessage("Product updated successfully");
                setTimeout(() => {
                    router.push('/admin');
                    router.refresh();
                }, 1500);
                return true;
            } else {
                throw new Error(data.message || "Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            setIsError(true);
            setErrorMessage(error.message || "Failed to update product");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    if (!initialData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
                    {successMessage}
                </div>
            )}
            {isError && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {errorMessage}
                </div>
            )}
            <BaseProductForm
                initialData={initialData}
                onSubmit={handleSubmit}
                submitButtonText="Update Product"
                isEdit={true}
            />
        </div>
    );
} 