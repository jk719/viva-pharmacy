import Link from 'next/link';
import { FaUser, FaCoins, FaShoppingBag } from 'react-icons/fa';

export default function ProfilePageContent({ user }) {
  // Ensure user has all required fields
  const serializedUser = {
    ...user,
    addresses: user.addresses || [],
    cumulativePoints: user.cumulativePoints || 0,
    currentTier: user.currentTier || 'BRONZE',
  };

  // Get current loyalty points and tier
  const currentPoints = serializedUser.cumulativePoints || 0;
  const currentTier = serializedUser.currentTier || 'BRONZE';

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top loyalty status bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            <div className="bg-[#FF9F43] rounded-full p-2">
              <FaCoins className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{currentPoints.toLocaleString()}</span>
                <span className="text-sm text-gray-500">Lifetime VivaBucks</span>
                {currentTier && (
                  <span className="bg-[#F0F4FF] text-[#6366F1] px-2 py-0.5 text-xs rounded-full font-medium uppercase">
                    {currentTier}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-[#FF9F43] h-2 rounded-full"
                  style={{ width: `${Math.min((currentPoints / 5000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              className="relative inline-flex items-center px-6 py-3 bg-[#0F2D5C] text-sm font-medium text-white focus:z-10 rounded-l-md"
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
              className="relative inline-flex items-center px-6 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 rounded-r-md"
            >
              <FaShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </Link>
          </div>
        </div>

        {/* Profile content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 bg-[#F7FAFF] border-b border-gray-200">
            <h2 className="text-lg font-medium text-[#0F2D5C]">Your Profile</h2>
            <p className="text-sm text-gray-500">Manage your information</p>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">First Name</label>
                  <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                    {serializedUser.name?.split(' ')[0] || ''}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                  <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                    {serializedUser.name?.split(' ').slice(1).join(' ') || ''}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                    {serializedUser.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone</label>
                  <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                    {serializedUser.phoneNumber || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            {serializedUser.addresses && serializedUser.addresses.length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-700 mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Street Address</label>
                    <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                      {serializedUser.addresses[0].street || ''}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">City</label>
                    <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                      {serializedUser.addresses[0].city || ''}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">State</label>
                    <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                      {serializedUser.addresses[0].state || ''}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">ZIP Code</label>
                    <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700">
                      {serializedUser.addresses[0].zipCode || ''}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-start mt-6">
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0F2D5C] hover:bg-[#0A1F3F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F2D5C]"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 