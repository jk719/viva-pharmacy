'use client';

import { useState, useEffect } from 'react';
// Import TIER_CONFIG directly, but don't import from emailService
// This line is problematic and causes Node.js modules to be bundled:
// import { TIER_CONFIG } from '@/lib/loyalty/loyaltyService';

// Instead, declare TIER_CONFIG directly or fetch it from an API
const TIER_CONFIG = {
  BRONZE: { points: 0, discount: 0 },
  SILVER: { points: 500, discount: 0.05 },
  GOLD: { points: 1000, discount: 0.1 },
  PLATINUM: { points: 2500, discount: 0.15 },
  SAPPHIRE: { points: 5000, discount: 0.2 },
  DIAMOND: { points: 10000, discount: 0.25 },
  LEGEND: { points: 25000, discount: 0.3 }
};

export default function LoyaltyManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/loyalty/users?filter=${filter}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (userId, adjustment) => {
    try {
      const response = await fetch('/api/admin/loyalty/adjust-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adjustment })
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adjusting points:', error);
    }
  };

  const handleIssueCoupon = async (userId) => {
    try {
      const response = await fetch('/api/admin/loyalty/issue-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error issuing coupon:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Loyalty Program Management</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
            {Object.keys(TIER_CONFIG).map(tier => (
              <option key={tier} value={tier.toLowerCase()}>
                {tier} Tier
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Coupons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.loyaltyProgram?.tier || 'None'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.loyaltyProgram?.points || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.loyaltyProgram?.coupons?.filter(c => !c.isUsed).length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAdjustPoints(user._id, 100)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Add Points
                      </button>
                      <button
                        onClick={() => handleIssueCoupon(user._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Issue Coupon
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold mb-4">User Details</h3>
            {/* Add detailed user loyalty information here */}
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 