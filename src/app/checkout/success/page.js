'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="mb-6">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Order Confirmed!
                </h1>
                {orderId && (
                    <p className="text-gray-600 mb-4">
                        Order ID: {orderId}
                    </p>
                )}
                <p className="text-gray-600 mb-8">
                    Thank you for your order. We'll send you a confirmation email shortly.
                </p>
                <Link 
                    href="/"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
} 