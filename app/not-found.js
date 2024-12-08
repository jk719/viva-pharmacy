'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link 
          href="/"
          className="text-white px-6 py-3 rounded-lg transition-colors inline-block"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
