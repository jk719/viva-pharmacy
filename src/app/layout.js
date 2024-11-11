// src/app/layout.js
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar"; // Import Navbar component
import Image from "next/image"; // Make sure Image is imported
import Link from "next/link"; // Import Link for internal navigation
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartProvider>
            {/* Navbar */}
            <Navbar /> {/* Use Navbar component here */}

            {/* Main Content */}
            <main className="p-6 bg-white min-h-screen">
              <div className="container mx-auto">
                {children}
              </div>
            </main>

            {/* Footer */}
            <footer className="footer bg-primary-color text-white p-4">
              <div className="container mx-auto flex justify-between items-center flex-wrap space-y-2 md:space-y-0 text-center md:text-left">
                {/* Footer Logo */}
                <div className="flex items-center">
                  <Image
                    src="/images/viva-online-logo.png"
                    alt="VIVA Pharmacy & Wellness Logo"
                    width={150}
                    height={50}
                  />
                </div>

                {/* Social Media and Products Link */}
                <div className="flex space-x-4 items-center justify-center">
                  <Link href="/products" legacyBehavior>
                    <a className="hover:underline text-white text-sm md:text-base">
                      Products
                    </a>
                  </Link>
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
                <div className="text-center text-xs md:text-sm">
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
