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
import { motion, AnimatePresence } from "framer-motion";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <motion.div
      className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="theme-color" content="#003366" /></head>
      <body className="bg-white text-gray-900 flex flex-col min-h-screen">
        <Providers>
          <header className="fixed top-0 left-0 right-0 w-full bg-white z-40">
            <div className="bg-primary">
              <Navbar />
            </div>
            <div className="bg-white border-b">
              <HeaderProgress />
            </div>
          </header>

          <div className="h-[240px] md:h-[200px]" />

          <main className="flex-grow w-full max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<LoadingSpinner />}>
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </main>

          <RewardAlert />
          
          <footer className="bg-primary text-white mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="flex justify-center md:justify-start">
                  <Image
                    src="/images/viva-online-logo.png"
                    alt="VIVA Pharmacy & Wellness"
                    width={140}
                    height={45}
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="flex justify-center space-x-8">
                  {[
                    { Icon: FaInstagram, href: "https://instagram.com/vivapharmacy", label: "Instagram" },
                    { Icon: FaFacebook, href: "https://facebook.com/vivapharmacy", label: "Facebook" },
                    { Icon: FaTiktok, href: "https://tiktok.com/@vivapharmacy", label: "TikTok" },
                  ].map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="hover:text-white/80 transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                      <Icon size={24} />
                    </a>
                  ))}
                </div>

                <div className="text-sm text-center md:text-right text-white/90">
                  &copy; {new Date().getFullYear()} VIVA Pharmacy & Wellness
                  <br />
                  <span className="text-white/70">All rights reserved</span>
                </div>
              </div>
            </div>
          </footer>

          <div id="modal-root" className="relative z-50" />
          <Toaster 
            position="bottom-right"
            containerStyle={{
              bottom: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 4000,
              className: "!bg-white !text-gray-900 !shadow-lg",
              success: {
                icon: "🎉",
                className: "!bg-green-50 !border-l-4 !border-green-500",
              },
              error: {
                icon: "⚠️",
                className: "!bg-red-50 !border-l-4 !border-red-500",
              }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
