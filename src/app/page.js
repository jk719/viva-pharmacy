// src/app/page.js
"use client";

import FeaturedProducts from '../components/FeaturedProducts'; // Import the FeaturedProducts component

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* FeaturedProducts component now handles the heading */}
      <FeaturedProducts />

      {/* View All Products Button */}
      <section className="my-8 text-center">
        <a
          href="/products"
          className="inline-block mt-4 px-6 py-2 bg-primary-color text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          View All Products
        </a>
      </section>
    </div>
  );
}
