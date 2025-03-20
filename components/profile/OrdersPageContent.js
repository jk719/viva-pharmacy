import Link from 'next/link';
import { FaUser, FaCoins, FaShoppingBag } from 'react-icons/fa';
import OrderHistory from '@/components/profile/OrderHistory';

export default function OrdersPageContent({ user }) {
  // Ensure user has all required fields
  const serializedUser = {
    ...user,
    cumulativePoints: user.cumulativePoints || 0,
    currentTier: user.currentTier || 'BRONZE'
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 mb-6">
          Manage your account and view your orders
        </p>
        
        {/* Navigation tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <Link
              href="/profile"
              className="relative inline-flex items-center px-6 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 rounded-l-md"
            >
              <FaUser className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/profile/rewards"
              className="relative inline-flex items-center px-6 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10"
            >
              <FaCoins className="mr-2 h-4 w-4" />
              VivaBucks
            </Link>
            <Link
              href="/profile/orders"
              className="relative inline-flex items-center px-6 py-3 bg-[#0F2D5C] text-sm font-medium text-white focus:z-10 rounded-r-md"
            >
              <FaShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </Link>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 bg-[#F7FAFF] border-b border-gray-200">
            <h2 className="text-xl font-medium text-[#0F2D5C]">Order History</h2>
            <p className="text-sm text-gray-500">View your past orders and track your purchases</p>
          </div>
          
          <div className="p-6">
            <OrderHistory userId={user._id} />
          </div>
        </div>
      </div>
    </div>
  );
} 