"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import toast from 'react-hot-toast';
import BaseProductForm from './BaseProductForm';
import { categories } from '@/data/categories';

// Debug logging for categories
console.log('Available Categories:', categories.map(c => ({
    name: c.name,
    slug: c.slug,
    items: c.items?.map(i => ({ name: i.name, slug: i.slug }))
})));

// Helper function to convert string to slug with debug logging
const toSlug = (str) => {
    if (!str) {
        console.log('toSlug received empty string');
        return '';
    }
    const slug = str.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    console.log('toSlug conversion:', { original: str, slug });
    return slug;
};

// Helper function to find the most appropriate category for a product
const findBestMatchingCategory = (productCategory) => {
    console.log('Finding best match for:', productCategory);

    // If the product is a cough medicine, map it to Children's Medicine
    if (productCategory?.toLowerCase().includes('cough')) {
        const childrensMedicine = categories.find(c => c.slug === 'childrens-medicine-wellness');
        if (childrensMedicine) {
            return {
                category: childrensMedicine,
                item: childrensMedicine.items.find(i => i.slug === 'cough-cold-remedies')
            };
        }
    }

    // Add more mappings as needed
    return null;
};

// Updated findValidSlugs function
const findValidSlugs = (category, item) => {
    try {
        console.log('Finding slugs for:', { 
            category, 
            item,
            categoryType: typeof category,
            itemType: typeof item 
        });

        // Early validation
        if (!category || typeof category !== 'string') {
            console.error('Invalid category:', { category, type: typeof category });
            return {
                categorySlug: 'uncategorized',
                subcategorySlug: 'uncategorized',
                itemSlug: 'uncategorized',
                suggestedCategory: 'Uncategorized',
                suggestedItem: 'Uncategorized',
                originalCategory: category || 'None',
                originalItem: item || 'None'
            };
        }

        // Try to find exact match first
        const categorySlug = toSlug(category);
        let categoryObj = categories.find(c => 
            c.name === category || 
            c.slug === categorySlug || 
            toSlug(c.name) === categorySlug
        );

        let matchedItem = null;

        // If no exact match, try category mappings
        if (!categoryObj) {
            console.log('No exact category match, checking mappings...');
            
            // Map cough medicines to Children's Medicine
            if (category.toLowerCase().includes('cough')) {
                categoryObj = categories.find(c => c.slug === 'childrens-medicine-wellness');
                if (categoryObj) {
                    matchedItem = categoryObj.items.find(i => i.slug === 'cough-cold-remedies');
                    console.log('Mapped cough medicine to:', categoryObj.name);
                }
            }
            
            // Add more category mappings here
            // Example: Pain relief mapping
            else if (category.toLowerCase().includes('pain')) {
                categoryObj = categories.find(c => c.slug === 'pain-fever-relief');
            }
        }

        // If still no match, use default category
        if (!categoryObj) {
            console.warn('No category match found for:', category);
            categoryObj = categories.find(c => c.slug === 'general-health') || categories[0];
        }

        // Find or suggest appropriate item
        if (!matchedItem && item) {
            const itemSlug = toSlug(item);
            matchedItem = categoryObj.items.find(i => 
                i.name === item || 
                i.slug === itemSlug || 
                toSlug(i.name) === itemSlug
            );
        }

        // If no matching item found, use first item in category
        if (!matchedItem) {
            matchedItem = categoryObj.items[0];
            console.log('Using default item:', matchedItem.name);
        }

        return {
            categorySlug: categoryObj.slug,
            subcategorySlug: categoryObj.slug,
            itemSlug: matchedItem.slug,
            suggestedCategory: categoryObj.name,
            suggestedItem: matchedItem.name,
            originalCategory: category,
            originalItem: item || matchedItem.name
        };
    } catch (error) {
        console.error('Error in findValidSlugs:', error);
        // Return a default mapping instead of null
        return {
            categorySlug: 'general-health',
            subcategorySlug: 'general-health',
            itemSlug: 'general-health',
            suggestedCategory: 'General Health',
            suggestedItem: 'General Health',
            originalCategory: category || 'Unknown',
            originalItem: item || 'Unknown'
        };
    }
};

export default function EditProductForm({ product }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [initialData, setInitialData] = useState(null);
    const [hasProcessedCategory, setHasProcessedCategory] = useState(false);

    useEffect(() => {
        if (!product || hasProcessedCategory) return;

        try {
            console.log('Processing product:', product);

            const validSlugs = findValidSlugs(
                product.category || product.categorySlug,
                product.item || product.itemSlug
            );

            if (!validSlugs) {
                setIsError(true);
                setErrorMessage('Could not determine valid category. Please select a category manually.');
                return;
            }

            // If category was mapped to a different one, show a notification
            if (validSlugs.originalCategory !== validSlugs.suggestedCategory) {
                toast.success(
                    `Category "${validSlugs.originalCategory}" was mapped to "${validSlugs.suggestedCategory}"`,
                    {
                        id: `category-mapping-${product._id}`, // Prevent duplicate toasts
                        duration: 3000
                    }
                );
            }

            const transformedData = {
                ...product,
                ...validSlugs,
                activeIngredients: product.activeIngredients || [],
                warnings: product.warnings || [],
                contraindications: product.contraindications || [],
                sideEffects: product.sideEffects || [],
                stock: product.stock || 0,
                isPopular: product.isPopular || false,
                isNewProduct: product.isNewProduct || false,
                isFeatured: product.isFeatured || false,
            };
            
            setInitialData(transformedData);
            setHasProcessedCategory(true);
        } catch (error) {
            console.error('Error in EditProductForm useEffect:', error);
            setIsError(true);
            setErrorMessage('Error loading product data: ' + error.message);
        }
    }, [product, hasProcessedCategory]);

    const handleSubmit = async (formData) => {
        try {
            setIsLoading(true);
            setIsError(false);
            setErrorMessage("");
            
            const loadingToast = toast.loading('Updating product...');
            
            console.log('Form data before validation:', formData);
            
            // Get valid slugs for the submission
            const validSlugs = findValidSlugs(
                formData.categorySlug || formData.category,
                formData.itemSlug || formData.item
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