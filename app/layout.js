// src/app/layout.js
"use client";

import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import HeaderProgress from '@/components/HeaderProgress';
import RewardAlert from '@/components/RewardAlert';
import ProductFilter from '@/components/products/ProductFilter';
import { useCategory } from '@/context/CategoryContext';
import products from '../lib/products/data';

// Create a wrapper component for the filter to use the context
function FilterWrapper() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const categories = ["All", ...new Set(products.map(product => product.category))];

  return (
    <ProductFilter 
      categories={categories}
      selectedCategory={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="source-map-support" content="false" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="bg-white text-primary-color">
        <Providers>
          <header className="fixed top-0 left-0 right-0 w-full bg-white z-50">
            <div className="bg-primary-color w-full">
              <Navbar />
            </div>
            
            <div className="bg-white w-full border-b py-2">
              <HeaderProgress />
            </div>

            <div className="bg-white w-full border-b shadow-md py-2">
              <FilterWrapper />
            </div>
          </header>

          <div className="h-[400px] sm:h-[320px]" />

          <main className="min-h-screen w-full">
            <div className="container mx-auto px-4">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
                </div>
              }>
                {children}
              </Suspense>
            </div>
          </main>

          <RewardAlert />
          
          <footer className="footer bg-primary text-white py-6">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0 px-4">
              <div className="flex items-center justify-center md:justify-start">
                <Image
                  src="/images/viva-online-logo.png"
                  alt="VIVA Pharmacy & Wellness Logo"
                  width={120}
                  height={40}
                  priority
                  className="object-contain"
                />
              </div>
              <div className="flex space-x-6 items-center justify-center">
                <a 
                  href="https://www.instagram.com/yourbusiness" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram" 
                  className="hover:text-gray-300"
                >
                  <FaInstagram size={20} />
                </a>
                <a 
                  href="https://www.facebook.com/yourbusiness" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook" 
                  className="hover:text-gray-300"
                >
                  <FaFacebook size={20} />
                </a>
                <a 
                  href="https://www.tiktok.com/@yourbusiness" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="TikTok" 
                  className="hover:text-gray-300"
                >
                  <FaTiktok size={20} />
                </a>
              </div>
              <div className="text-xs md:text-sm text-center md:text-left">
                &copy; {new Date().getFullYear()} VIVA Pharmacy & Wellness. All rights reserved.
              </div>
            </div>
          </footer>

          <div id="modal-root" className="relative z-50" />
          <Toaster 
            position="top-right"
            containerStyle={{
              top: '400px',
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4CAF50',
                }
              },
              error: {
                duration: 4000,
                theme: {
                  primary: '#E57373',
                }
              }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
