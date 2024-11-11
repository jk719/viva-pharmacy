// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import AuthButtons from "./AuthButtons";

export default function Navbar() {
  return (
    <nav className="p-4 bg-primary-color text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" legacyBehavior>
          <a className="flex items-center">
            <Image
              src="/images/viva-online-logo.png"
              alt="VIVA Pharmacy & Wellness Logo"
              width={180}
              height={60}
            />
          </a>
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
          <Link href="/cart" legacyBehavior>
            <a className="hover:underline flex items-center text-white">
              <ClientCartIcon />
            </a>
          </Link>
          <AuthButtons emailColor="text-red-600" />
        </div>
      </div>
    </nav>
  );
}
