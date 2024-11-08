// src/app/layout.js
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/CartContext";
import ClientCartIcon from "../components/ClientCartIcon";
import AuthButtons from "../components/AuthButtons";
import Image from "next/image";
import Link from 'next/link'; // Import Link for internal navigation
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import "./globals.css";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    <CartProvider>
                        {/* Navbar */}
                        <nav className="p-4 bg-primary-color text-white">
                            <div className="container mx-auto flex justify-between items-center">
                                {/* Logo */}
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src="/images/viva-online-logo.png"
                                        alt="VIVA Pharmacy & Wellness Logo"
                                        width={180}
                                        height={60}
                                    />
                                </Link>
                                {/* Search Bar */}
                                <div className="flex-grow mx-4">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full p-2 rounded-lg bg-white text-primary-color placeholder-primary-color focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {/* Cart and Auth */}
                                <div className="flex items-center space-x-6">
                                    <Link href="/cart" className="hover:underline flex items-center text-white">
                                        <ClientCartIcon />
                                    </Link>
                                    <AuthButtons emailColor="text-red-600" />
                                </div>
                            </div>
                        </nav>

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
                                    <Link href="/products" className="hover:underline text-white text-sm md:text-base">
                                        Products
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
