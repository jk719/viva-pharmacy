import { Suspense } from 'react';
import OrderDetailsView from '@/components/admin/OrderDetailsView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Order Details - Admin Dashboard',
  description: 'View and manage order details'
};

export default async function OrderDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const orderId = await Promise.resolve(params).then(p => p.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSpinner />}>
          <OrderDetailsView orderId={orderId} />
        </Suspense>
      </div>
    </div>
  );
} 