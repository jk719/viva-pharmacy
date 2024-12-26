"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create a context for the category
const CategoryContext = createContext();

// Custom hook to use the category context
export function useCategory() {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
}

// CategoryProvider component
export function CategoryProvider({ children }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                
                if (data.success) {
                    // Extract unique categories from products
                    const uniqueCategories = ['All', ...new Set(
                        data.products.map(product => product.category)
                    )].sort();
                    
                    setCategories(uniqueCategories);
                    setError(null);
                } else {
                    setError('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    // Load selected category from localStorage on initial mount
    useEffect(() => {
        try {
            const savedCategory = localStorage.getItem('selectedCategory');
            if (savedCategory && categories.includes(savedCategory)) {
                setSelectedCategory(savedCategory);
            }
        } catch (error) {
            console.error('Error loading category:', error);
        } finally {
            setLoading(false);
        }
    }, [categories]);

    // Save to localStorage when category changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('selectedCategory', selectedCategory);
        }
    }, [selectedCategory, loading]);

    // Helper function to get products by category
    const getProductsByCategory = useCallback(async (category = selectedCategory) => {
        try {
            const params = new URLSearchParams();
            
            // Only add category parameter if not "All"
            if (category !== 'All') {
                params.append('category', category);
            }
            
            // Log the request for debugging
            console.log('Fetching products with params:', params.toString());
            
            const response = await fetch(`/api/products?${params}`);
            const data = await response.json();
            
            if (data.success) {
                // Log the response for debugging
                console.log('Products fetched:', {
                    category,
                    count: data.products.length,
                    categories: [...new Set(data.products.map(p => p.category))]
                });
                return data.products;
            } else {
                throw new Error(data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }, [selectedCategory]);

    // Helper function to check if a category exists
    const categoryExists = useCallback((category) => {
        return categories.includes(category);
    }, [categories]);

    // Helper function to get category statistics
    const getCategoryStats = useCallback(async () => {
        try {
            const products = await getProductsByCategory('All');
            const stats = categories.reduce((acc, category) => {
                if (category === 'All') return acc;
                const categoryProducts = products.filter(p => p.category === category);
                acc[category] = {
                    count: categoryProducts.length,
                    averagePrice: categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length || 0
                };
                return acc;
            }, {});
            return stats;
        } catch (error) {
            console.error('Error getting category stats:', error);
            throw error;
        }
    }, [categories, getProductsByCategory]);

    const value = {
        selectedCategory,
        setSelectedCategory,
        categories,
        loading,
        error,
        getProductsByCategory,
        categoryExists,
        getCategoryStats
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
} 