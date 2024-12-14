"use client";

import { createContext, useContext, useState, useEffect } from 'react';

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
    const [loading, setLoading] = useState(true);

    // Load selected category from localStorage on initial mount
    useEffect(() => {
        try {
            const savedCategory = localStorage.getItem('selectedCategory');
            if (savedCategory) {
                setSelectedCategory(savedCategory);
            }
        } catch (error) {
            console.error('Error loading category:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save to localStorage when category changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('selectedCategory', selectedCategory);
        }
    }, [selectedCategory, loading]);

    const value = {
        selectedCategory,
        setSelectedCategory,
        loading
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
} 