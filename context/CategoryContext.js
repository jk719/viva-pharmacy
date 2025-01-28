"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { categories, getCategoryBySlug, getItemBySlug } from '@/data/categories';

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
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load selected categories from localStorage
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('selectedCategories')) || {};
            if (saved.category) {
                // Handle both "All" and category slugs
                if (saved.category === "All") {
                    setSelectedCategory("All");
                } else if (categories.some(c => c.slug === saved.category)) {
                    setSelectedCategory(saved.category);
                    if (saved.item) setSelectedItem(saved.item);
                } else {
                    setSelectedCategory("All"); // Fallback to "All" if invalid
                }
            } else {
                setSelectedCategory("All"); // Default to "All"
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            setSelectedCategory("All"); // Fallback to "All" on error
        } finally {
            setLoading(false);
        }
    }, []);

    // Save selections to localStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('selectedCategories', JSON.stringify({
                category: selectedCategory,
                item: selectedItem
            }));
        }
    }, [selectedCategory, selectedItem, loading]);

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSelectedItem(null);
    };

    const value = {
        selectedCategory,
        setSelectedCategory: handleCategorySelect,
        selectedItem,
        setSelectedItem,
        categories: ["All", ...categories.map(c => c.name)], // Include "All" in categories
        loading,
        error,
        getCurrentCategory: () => {
            if (selectedCategory === "All") return null;
            return getCategoryBySlug(selectedCategory);
        },
        getCurrentItem: () => {
            if (!selectedCategory || selectedCategory === "All") return null;
            return selectedItem ? 
                getItemBySlug(selectedCategory, selectedItem) : null;
        },
        // Helper function to get category display name
        getCategoryDisplayName: (categorySlug) => {
            if (categorySlug === "All") return "All";
            const category = categories.find(c => c.slug === categorySlug);
            return category ? category.name : categorySlug;
        },
        // Helper function to get item display name
        getItemDisplayName: (categorySlug, itemSlug) => {
            if (!categorySlug || !itemSlug) return "";
            const item = getItemBySlug(categorySlug, itemSlug);
            return item ? item.name : itemSlug;
        },
        // Get all items for a category
        getCategoryItems: (categorySlug) => {
            if (!categorySlug || categorySlug === "All") return [];
            const category = getCategoryBySlug(categorySlug);
            return category ? category.items : [];
        }
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
} 