"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeaturedProducts from './FeaturedProducts';

export default function ProductTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'featured', label: 'Featured', component: <FeaturedProducts /> },
    { id: 'new', label: 'New Arrivals', component: <FeaturedProducts filter="new" /> },
    { id: 'popular', label: 'Best Sellers', component: <FeaturedProducts filter="popular" /> }
  ];

  return (
    <div>
      <div className="flex space-x-4 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors
                       relative ${activeTab === tab.id 
                         ? 'text-primary' 
                         : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {tabs.find(tab => tab.id === activeTab)?.component}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 