'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { FaBox, FaShoppingBag, FaTruck, FaCheck, FaSpinner, FaExclamationCircle, FaClock, FaImage } from 'react-icons/fa';
import { getCloudinaryUrl, FALLBACK_IMAGE } from '@/lib/cloudinary';
import ProductImage from '@/components/ProductImage';

// Status icons and colors mapping
const STATUS_CONFIG = {
  'Pending': { icon: <FaClock />, bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Processing': { icon: <FaSpinner className="animate-spin" />, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Shipped': { icon: <FaTruck />, bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Delivered': { icon: <FaCheck />, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'Completed': { icon: <FaCheck />, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'Cancelled': { icon: <FaExclamationCircle />, bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

// Helper function to normalize product names for image matching
function normalizeProductName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .trim();
}

export default function OrderHistory({ userId, limit }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({ 
    apiCalled: false, 
    responseStatus: null,
    orderCount: 0
  });
  
  // Use ref to track if data has already been fetched to prevent multiple fetches
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Skip the effect if we don't have a userId or if we've already fetched
    if (!userId || hasFetchedRef.current) {
      if (!userId) {
        console.log('OrderHistory: No userId provided');
        setLoading(false);
      }
      return;
    }

    console.log('OrderHistory: Loading data for userId:', userId);
    const controller = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setDebug(prev => ({ ...prev, apiCalled: true }));
        
        // Fetch orders
        console.log('OrderHistory: Starting API request');
        const ordersResponse = await fetch(`/api/orders/${userId}`, { 
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!isMounted) return;

        // Mark that we've fetched data
        hasFetchedRef.current = true;

        // Debug response
        setDebug(prev => ({ 
          ...prev, 
          responseStatus: ordersResponse.status,
        }));

        if (!ordersResponse.ok) {
          throw new Error(`HTTP error! status: ${ordersResponse.status}`);
        }

        const ordersData = await ordersResponse.json();
        console.log('OrderHistory: Orders API response received, count:', ordersData.length);
        
        setDebug(prev => ({ 
          ...prev, 
          orderCount: ordersData?.length || 0
        }));

        // Ensure ordersData is an array
        if (!Array.isArray(ordersData)) {
          console.error('OrderHistory: API did not return an array', ordersData);
          throw new Error('Invalid order data format');
        }

        // Safely process orders - ensure items array exists and each item has required properties
        const processedOrders = ordersData.map(order => {
          return {
            ...order,
            items: (order.items || []).map(item => {
              console.log('Processing item:', {
                name: item.name,
                imageAvailable: !!item.image
              });
              
              return {
                ...item,
                name: item.name || "Unknown Product",
                price: item.price || 0,
                quantity: item.quantity || 1,
                // Don't modify the image here - let the ProductImage component handle it
              };
            })
          };
        });

        console.log('OrderHistory: Processed orders:', processedOrders.length);
        
        // Apply limit if specified
        setOrders(limit ? processedOrders.slice(0, limit) : processedOrders);
        setLoading(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        
        if (isMounted) {
          console.error('Error in OrderHistory:', error);
          setError(error.message);
          setLoading(false);
          toast.error('Failed to load order history');
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId, limit]);

  // Function to handle manual refresh
  const handleRefresh = () => {
    hasFetchedRef.current = false; // Reset fetch tracker
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>Error loading orders: {error}</p>
        <div className="mt-2 p-3 bg-gray-50 text-left text-xs overflow-auto max-h-40 rounded">
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
        <button 
          onClick={handleRefresh}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-xl">
        <div className="text-gray-400 mb-2">📦</div>
        <p className="text-gray-600">No orders found</p>
        <div className="mt-4 p-3 bg-gray-50 text-left text-xs overflow-auto max-h-40 rounded">
          <p className="font-bold mb-1">Debug Information:</p>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history px-4 md:px-0">
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id || order.id} className="mb-6 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Order ID:</span>
                <span className="text-sm font-medium">{order._id || order.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-semibold text-lg">${(order.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-gray-100">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={item._id || item.id || index} className="p-4 flex gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 bg-gray-50 rounded-md">
                      {/* Use the imported ProductImage component */}
                      <ProductImage 
                        src={item.image}
                        alt={item.name || "Product"}
                        fill
                        className="object-contain rounded-md p-1"
                        sizes="(max-width: 64px) 100vw, 64px"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm text-[#003366] truncate">
                        {item.name || "Unnamed product"}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity || 1}
                        </span>
                        <span className="text-sm font-medium">
                          ${(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No items found in this order
                </div>
              )}
            </div>
          </div>
        ))}

        {limit && orders.length >= limit && (
          <div className="text-center mt-4">
            <Link 
              href="/profile/orders" 
              className="text-blue-600 hover:underline text-sm inline-flex items-center"
            >
              View all orders <span className="ml-1">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 