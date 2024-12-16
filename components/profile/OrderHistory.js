'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        console.log('No userId provided to OrderHistory component');
        setLoading(false);
        setError('User ID is required');
        return;
      }

      try {
        console.log('Attempting to fetch orders for userId:', userId);
        const response = await fetch(`/api/orders/${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          throw new Error('Invalid data format received from server');
        }

        console.log('Orders successfully fetched:', data);
        setOrders(data);
        setError(null);
      } catch (error) {
        console.error('Error in OrderHistory:', error);
        setError(error.message);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>Error loading orders: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="order-history px-4 md:px-0">
      <h2 className="text-xl font-bold mb-6 text-[#003366] border-b pb-2">
        Order History
      </h2>
      
      {orders?.map(order => (
        <div key={order._id} className="mb-6 bg-white rounded-xl overflow-hidden shadow-sm">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Order ID:</span>
              <span className="text-sm font-medium">{order._id}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="font-semibold text-lg">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="divide-y divide-gray-100">
            {order.items.map((item, index) => (
              <div key={item._id || index} className="p-4 flex gap-4">
                {item.image ? (
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-md"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 bg-gray-50 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-sm text-[#003366] truncate">{item.name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {(!orders || orders.length === 0) && (
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <div className="text-gray-400 mb-2">📦</div>
          <p className="text-gray-600">No orders found</p>
        </div>
      )}
    </div>
  );
} 