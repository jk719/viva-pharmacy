// src/app/checkout/page.js
"use client";

import { useCart } from '@/context/CartContext';
import PaymentForm from '@/components/checkout/PaymentForm';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, total } = useCart();
    const router = useRouter();

    if (!items?.length) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <p className="mt-4">
                    <button 
                        onClick={() => router.push('/')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Continue Shopping
                    </button>
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PaymentForm items={items} total={total} />
        </div>
    );
}
