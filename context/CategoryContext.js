"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { categories, getCategoryBySlug, getSubcategoryBySlug } from '@/data/categories';

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
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
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
                    if (saved.subcategory) setSelectedSubcategory(saved.subcategory);
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
                subcategory: selectedSubcategory,
                item: selectedItem
            }));
        }
    }, [selectedCategory, selectedSubcategory, selectedItem, loading]);

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory(null);
        setSelectedItem(null);
    };

    const value = {
        selectedCategory,
        setSelectedCategory: handleCategorySelect,
        selectedSubcategory,
        setSelectedSubcategory,
        selectedItem,
        setSelectedItem,
        categories: ["All", ...categories.map(c => c.name)], // Include "All" in categories
        loading,
        error,
        getCurrentCategory: () => {
            if (selectedCategory === "All") return null;
            return getCategoryBySlug(selectedCategory);
        },
        getCurrentSubcategory: () => {
            if (!selectedCategory || selectedCategory === "All") return null;
            return selectedSubcategory ? 
                getSubcategoryBySlug(selectedCategory, selectedSubcategory) : null;
        },
        // Helper function to get category display name
        getCategoryDisplayName: (categorySlug) => {
            if (categorySlug === "All") return "All";
            const category = categories.find(c => c.slug === categorySlug);
            return category ? category.name : categorySlug;
        }
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
} 