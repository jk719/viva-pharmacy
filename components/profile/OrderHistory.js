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
    <div className="order-history">
      <h2 className="text-xl font-bold mb-4 text-center text-[#003366]">Order History</h2>
      {orders?.map(order => (
        <div key={order._id} className="order mb-6 p-4 border rounded-lg shadow-sm bg-white">
          <h3 className="font-semibold mb-2 text-center">Order ID: {order._id}</h3>
          <p className="mb-2 text-center">Total: ${order.total.toFixed(2)}</p>
          <p className="mb-4 text-center">Status: {order.status}</p>
          <div className="order-items grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.items.map(item => (
              <div key={item._id} className="flex items-center p-4 border rounded-lg">
                {item.image ? (
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-md"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="ml-4 flex-grow">
                  <h4 className="font-medium text-[#003366]">{item.name}</h4>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {(!orders || orders.length === 0) && (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No orders found</p>
        </div>
      )}
    </div>
  );
} 