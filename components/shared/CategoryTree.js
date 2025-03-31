"use client";

import { useMemo } from 'react';
import { categories } from '@/data/categories';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CategoryTree({ 
  selectedCategory, 
  selectedItem,
  onSelectCategory,
  onSelectItem
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Organize categories for visual tree
  const organizedCategories = useMemo(() => {
    return categories.map(category => ({
      ...category,
      isSelected: category.slug === selectedCategory,
      items: category.items.map(item => ({
        ...item,
        isSelected: item.slug === selectedItem
      }))
    }));
  }, [selectedCategory, selectedItem]);

  if (isMobile) {
    return null; // Don't show on mobile
  }

  return (
    <div className="h-[300px] overflow-auto border rounded-lg p-2 bg-white">
      <h3 className="font-medium text-sm mb-2 px-2">Category Hierarchy</h3>
      
      <div className="space-y-1">
        {organizedCategories.map(category => (
          <div key={category.slug} className="category-branch">
            <div 
              className={`
                flex items-center py-1.5 px-2 rounded cursor-pointer
                ${category.isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
              `}
              onClick={() => onSelectCategory(category.slug)}
            >
              {category.isSelected ? 
                <ChevronDownIcon className="w-4 h-4 mr-1" /> : 
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              }
              <span className="text-sm">{category.name}</span>
            </div>
            
            {category.isSelected && (
              <div className="ml-6 pl-2 border-l-2 border-gray-200">
                {category.items.map(item => (
                  <div 
                    key={item.slug}
                    className={`
                      py-1.5 px-2 text-sm rounded cursor-pointer
                      ${item.isSelected ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => onSelectItem(item.slug)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 