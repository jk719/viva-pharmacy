"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductManagement from '@/components/admin/ProductManagement';

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check authorization in useEffect instead of during render
    if (status === 'authenticated') {
      if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        router.push('/');
      }
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render product management if user is authorized
  if (status === 'authenticated' && ['ADMIN', 'MANAGER'].includes(session?.user?.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <ProductManagement />
      </div>
    );
  }

  // Return null while redirecting
  return null;
} 