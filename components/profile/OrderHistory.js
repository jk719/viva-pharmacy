'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        console.log('No userId provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching orders for userId:', userId);
        const response = await fetch(`/api/orders/${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        setOrders(data);
        console.log('Orders fetched from DB:', data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>;
  }

  if (!userId) {
    return <div className="text-center py-4">Unable to fetch orders. Please try again later.</div>;
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
              </div>
              <span className="font-semibold text-lg">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="divide-y divide-gray-100">
            {order.items.map(item => (
              <div key={item._id} className="p-4 flex gap-4">
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