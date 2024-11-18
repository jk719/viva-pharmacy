// src/app/layout.js
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-primary-color">
        <SessionProvider>
          <CartProvider>
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="main-content p-6 min-h-screen">
              <div className="container mx-auto">
                {/* Page content */}
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="footer bg-primary text-white py-6">
              <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
                {/* Footer Logo */}
                <div className="flex items-center justify-center md:justify-start">
                  <Image
                    src="/images/viva-online-logo.png"
                    alt="VIVA Pharmacy & Wellness Logo"
                    width={120} // Adjusted width for a balanced look
                    height={40}
                    priority
                    className="object-contain"
                  />
                </div>

                {/* Social Media Icons */}
                <div className="flex space-x-6 items-center justify-center">
                  <a href="https://www.instagram.com/yourbusiness" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-300">
                    <FaInstagram size={20} />
                  </a>
                  <a href="https://www.facebook.com/yourbusiness" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-300">
                    <FaFacebook size={20} />
                  </a>
                  <a href="https://www.tiktok.com/@yourbusiness" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-gray-300">
                    <FaTiktok size={20} />
                  </a>
                </div>

                {/* Footer Text */}
                <div className="text-xs md:text-sm text-center md:text-left">
                  &copy; {new Date().getFullYear()} VIVA Pharmacy & Wellness. All rights reserved.
                </div>
              </div>
            </footer>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
