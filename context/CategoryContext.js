"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { categories, getCategoryBySlug, getItemBySlug } from '../data/categories';

// Create a context for the category
const CategoryContext = createContext();

// Add debounce utility
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

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
    const [state, setState] = useState({
        selectedCategory: "All",
        selectedItem: null,
        loading: true,
        error: null
    });

    // Load categories from localStorage only once on mount
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('selectedCategories')) || {};
            setState(prev => ({
                ...prev,
                selectedCategory: saved.category || "All",
                selectedItem: saved.item || null,
                loading: false
            }));
        } catch (error) {
            console.error('Error loading categories:', error);
            setState(prev => ({
                ...prev,
                selectedCategory: "All",
                loading: false,
                error: error.message
            }));
        }
    }, []);

    // Debounced localStorage update
    const updateLocalStorage = useCallback(
        debounce((category, item) => {
            try {
                localStorage.setItem('selectedCategories', JSON.stringify({
                    category,
                    item
                }));
            } catch (error) {
                console.error('Error saving categories:', error);
            }
        }, 1000),
        []
    );

    // Update localStorage when selections change
    useEffect(() => {
        if (!state.loading) {
            updateLocalStorage(state.selectedCategory, state.selectedItem);
        }
    }, [state.selectedCategory, state.selectedItem, state.loading, updateLocalStorage]);

    // Memoized category selection handler
    const handleCategorySelect = useCallback((category) => {
        setState(prev => ({
            ...prev,
            selectedCategory: category,
            selectedItem: null
        }));
    }, []);

    // Memoized helper functions
    const getCurrentCategory = useCallback(() => {
        if (state.selectedCategory === "All") return null;
        return getCategoryBySlug(state.selectedCategory);
    }, [state.selectedCategory]);

    const getCurrentItem = useCallback(() => {
        if (!state.selectedCategory || state.selectedCategory === "All") return null;
        return state.selectedItem ? getItemBySlug(state.selectedCategory, state.selectedItem) : null;
    }, [state.selectedCategory, state.selectedItem]);

    // Memoized category list
    const categoryList = useMemo(() => 
        ["All", ...categories.map(c => c.name)],
        []
    );

    // Memoized context value
    const value = useMemo(() => ({
        selectedCategory: state.selectedCategory,
        setSelectedCategory: handleCategorySelect,
        selectedItem: state.selectedItem,
        setSelectedItem: (item) => setState(prev => ({ ...prev, selectedItem: item })),
        categories: categoryList,
        loading: state.loading,
        error: state.error,
        getCurrentCategory,
        getCurrentItem,
        getCategoryDisplayName: (categorySlug) => {
            if (categorySlug === "All") return "All";
            const category = categories.find(c => c.slug === categorySlug);
            return category ? category.name : categorySlug;
        },
        getItemDisplayName: (categorySlug, itemSlug) => {
            if (!categorySlug || !itemSlug) return "";
            const item = getItemBySlug(categorySlug, itemSlug);
            return item ? item.name : itemSlug;
        },
        getCategoryItems: (categorySlug) => {
            if (!categorySlug || categorySlug === "All") return [];
            const category = getCategoryBySlug(categorySlug);
            return category ? category.items : [];
        }
    }), [
        state.selectedCategory,
        state.selectedItem,
        state.loading,
        state.error,
        categoryList,
        handleCategorySelect,
        getCurrentCategory,
        getCurrentItem
    ]);

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
} 