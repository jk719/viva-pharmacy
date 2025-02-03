"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import toast from 'react-hot-toast';
import BaseProductForm from './BaseProductForm';
import { categories } from '@/data/categories';
console.log('Categories loaded:', { categoriesLength: categories?.length });

// Helper function to find valid slugs
const findValidSlugs = (category, subcategory, item, productName) => {
    try {
        // Input validation
        if (!category || typeof category !== 'string') {
            throw new Error('Invalid category provided');
        }

        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories data not properly loaded');
        }

        // Normalize inputs
        const normalizedCategory = category.trim().toLowerCase();
        const normalizedItem = item?.trim().toLowerCase();

        // Find category with defensive programming
        const categoryObj = categories.find(c => {
            if (!c || typeof c !== 'object') return false;
            return (c.slug?.toLowerCase() === normalizedCategory) ||
                   (c.name?.toLowerCase() === normalizedCategory);
        });

        if (!categoryObj) {
            console.error('Category not found:', { 
                category,
                availableCategories: categories.map(c => ({
                    name: c?.name || 'Unknown',
                    slug: c?.slug || 'Unknown'
                }))
            });
            return null;
        }

        // Validate items array
        if (!Array.isArray(categoryObj.items)) {
            console.error('Invalid items array for category:', categoryObj.name);
            return null;
        }

        // Find item with defensive programming
        if (!normalizedItem) {
            console.error('No item provided');
            return null;
        }

        const itemObj = categoryObj.items.find(i => {
            if (!i || typeof i !== 'object') return false;
            return (i.slug?.toLowerCase() === normalizedItem) ||
                   (i.name?.toLowerCase() === normalizedItem);
        });

        if (!itemObj) {
            console.error('Item not found:', {
                item,
                category: categoryObj.name,
                availableItems: categoryObj.items.map(i => ({
                    name: i?.name || 'Unknown',
                    slug: i?.slug || 'Unknown'
                }))
            });
            return null;
        }

        // Return validated slugs
        return {
            categorySlug: categoryObj.slug,
            subcategorySlug: categoryObj.slug, // Assuming same as category for now
            itemSlug: itemObj.slug
        };
    } catch (error) {
        console.error('Error in findValidSlugs:', error);
        return null;
    }
};

export default function EditProductForm({ product }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (!product) {
            console.log('No product data available yet');
            return;
        }

        if (!categories || !Array.isArray(categories)) {
            console.error('Categories not loaded properly');
            return;
        }

        try {
            console.log('Processing product:', {
                category: product.category || product.categorySlug,
                item: product.item || product.itemSlug,
            });

            // Get valid slugs based on the product's categories
            const validSlugs = findValidSlugs(
                product.category || product.categorySlug,
                product.item || product.itemSlug, // Use item for subcategory
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
            console.error('Error in EditProductForm useEffect:', error);
            setIsError(true);
            setErrorMessage('Error loading product data: ' + error.message);
        }
    }, [product]);

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setErrorMessage("");
            
            // Show loading toast
            const loadingToast = toast.loading('Updating product...');
            
            console.log('Form data before validation:', {
                category: formData.category || formData.categorySlug,
                item: formData.item || formData.itemSlug,
                formData
            });
            
            // Get valid slugs for the submission
            const validSlugs = findValidSlugs(
                formData.categorySlug || formData.category, // Use categorySlug first
                formData.categorySlug || formData.category, // Same for subcategory
                formData.itemSlug || formData.item,        // Use itemSlug first
                formData.name
            );

            console.log('Generated valid slugs:', validSlugs);

            if (!validSlugs) {
                throw new Error('Could not validate category hierarchy');
            }

            // Find the actual category data
            const category = categories.find(c => c.slug === validSlugs.categorySlug);
            if (!category) {
                console.error('Category not found:', validSlugs.categorySlug);
                throw new Error('Invalid category');
            }

            const item = category.items.find(i => i.slug === validSlugs.itemSlug);
            if (!item) {
                console.error('Item not found:', {
                    itemSlug: validSlugs.itemSlug,
                    categoryItems: category.items.map(i => i.slug)
                });
                throw new Error('Invalid item');
            }

            // Clean up the form data with actual category names
            const cleanedData = {
                ...formData,
                categorySlug: category.slug,
                subcategorySlug: category.slug,
                itemSlug: item.slug,
                category: category.name,
                subcategory: category.name,
                item: item.name,
                categoryPath: `${category.name} > ${item.name}`,
                categoryTagline: category.tagline,
            };

            console.log('Cleaned form data:', cleanedData);

            console.log('Submitting update for product:', product._id);

            const response = await fetch(`/api/products/${product._id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();
            
            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (!response.ok) {
                // Show error toast
                toast.error(data.message || `Failed to update product`);
                throw new Error(data.message || `Server error: ${response.status}`);
            }

            if (data.success) {
                // Show success toast
                toast.success('Product updated successfully!', {
                    duration: 3000,
                    position: 'top-center',
                    // Customize for mobile
                    style: {
                        maxWidth: '90vw',
                        margin: '0 auto',
                    },
                });
                
                await mutate('/api/products');
                await mutate(`/api/products/${product._id}`);
                
                const REDIRECT_DELAY = 1500; // 1.5 seconds
                setTimeout(() => {
                    router.push('/admin');
                    router.refresh();
                }, REDIRECT_DELAY);
                return true;
            }
        } catch (error) {
            console.error("Error updating product:", error);
            setIsError(true);
            setErrorMessage(error.message || "Failed to update product");
            // Show error toast
            toast.error(error.message || 'Failed to update product', {
                duration: 4000,
                position: 'top-center',
                style: {
                    maxWidth: '90vw',
                    margin: '0 auto',
                },
            });
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