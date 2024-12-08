'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

function SuccessContent() {
  const { clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Only clear cart once on mount
    const timer = setTimeout(() => {
      clearCart();
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-4">Thank you for your purchase.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
