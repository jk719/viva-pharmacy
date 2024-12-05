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
    <div>
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-center py-4">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Order #{order._id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold">${order.total.toFixed(2)}</p>
              </div>
              <div className="mt-4">
                <p className="font-medium">Items:</p>
                <ul className="list-disc list-inside">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-sm">
                      <div className="flex items-center mb-4">
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
                          <div className="h-20 w-20 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                            <span>No Image</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <h4 className="font-medium">{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{order.status}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 