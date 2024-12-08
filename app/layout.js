// src/app/layout.js
"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import VivaBucksProgress from '@/components/VivaBucksProgress';
import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import "./globals.css";

// Create a client component wrapper for providers
function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-center"
          containerStyle={{
            top: '80px',
            zIndex: 10000
          }}
          toastOptions={{
            duration: 5000,
            style: {
              background: '#003366',
              color: '#fff',
              padding: '16px',
              fontSize: '16px',
              maxWidth: '90vw',
              textAlign: 'center',
              zIndex: 10000,
            },
            success: {
              iconTheme: {
                primary: 'white',
                secondary: '#003366',
              },
            },
            error: {
              iconTheme: {
                primary: 'white',
                secondary: '#003366',
              },
            },
          }}
        />
      </CartProvider>
    </SessionProvider>
  );
}

// Main layout component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="source-map-support" content="false" />
      </head>
      <body className="bg-white text-primary-color">
        <Providers>
          <Navbar />
          <div className="pt-[80px] md:pt-[64px]">
            <VivaBucksProgress />
            <main className="px-6 pb-6 min-h-screen">
              <div className="container mx-auto">
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                }>
                  {children}
                </Suspense>
              </div>
            </main>
          </div>
          <footer className="footer bg-primary text-white py-6">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
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
        </Providers>
        <Toaster 
          position="top-right"
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
                secondary: '#131313',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
