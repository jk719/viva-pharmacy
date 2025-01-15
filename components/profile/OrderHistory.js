'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { fetchProducts } from '@/lib/api';
import cloudinaryUrls from '@/data/cloudinaryUrls.json';

export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Memoize the product mapping function
  const createProductsMap = useCallback((products) => {
    const mapping = {};
    products.forEach(product => {
      if (product._id && product.image) {
        mapping[product._id] = product;
      }
    });
    return mapping;
  }, []);

  // Add this debug function
  const debugProductImage = (product, item) => {
    console.log('Debug Product Image:');
    console.log('Product:', product);
    console.log('Item:', item);
    if (product) {
      const imageName = product.image?.split('/').pop();
      console.log('Image Name:', imageName);
      console.log('Available Cloudinary URLs:', Object.keys(cloudinaryUrls));
      console.log('Matching URL:', cloudinaryUrls[imageName]);
    }
  };

  // Helper function to normalize product names for comparison
  const normalizeProductName = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
      .trim();
  };

  // Helper function to find matching Cloudinary URL
  const findMatchingCloudinaryUrl = (productName) => {
    const normalizedProductName = normalizeProductName(productName);
    
    // Find matching URL in cloudinaryUrls
    const matchingKey = Object.keys(cloudinaryUrls).find(key => {
      const normalizedKey = normalizeProductName(key.replace('.png', ''));
      return normalizedKey.includes(normalizedProductName) ||
             normalizedProductName.includes(normalizedKey);
    });

    return matchingKey ? cloudinaryUrls[matchingKey] : null;
  };

  // Memoize findProductImage
  const findProductImage = useCallback((product) => {
    if (!product) return null;
    
    // 1. First try to get the product from our map
    const productFromMap = productsMap[product._id];
    if (productFromMap?.image) {
      return productFromMap.image;
    }
    
    // 2. If no direct product image, try cloudinary mapping
    if (product.name) {
      const normalizedName = normalizeProductName(product.name);
      const matchingUrl = Object.entries(cloudinaryUrls).find(([key, _]) => {
        const normalizedKey = normalizeProductName(key.replace('.png', ''));
        return normalizedKey.includes(normalizedName) || 
               normalizedName.includes(normalizedKey);
      });

      if (matchingUrl) {
        return matchingUrl[1];
      }
    }
    
    // 3. If still no image, try to find a fallback from products
    const fallbackProduct = Object.values(productsMap).find(p => 
      normalizeProductName(p.name) === normalizeProductName(product.name)
    );

    return fallbackProduct?.image || null;
  }, []); // Remove productsMap dependency

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch both orders and products in parallel
        const [productsData, ordersResponse] = await Promise.all([
          fetchProducts({ signal: controller.signal }),
          fetch(`/api/orders/${userId}`, { signal: controller.signal })
        ]);

        if (!isMounted) return;

        const ordersData = await ordersResponse.json();

        if (!ordersResponse.ok) {
          throw new Error(ordersData.error || `HTTP error! status: ${ordersResponse.status}`);
        }

        if (productsData.success) {
          const productMapping = createProductsMap(productsData.products);
          setProductsMap(productMapping);
        }

        const processedOrders = ordersData.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            image: findProductImage({ 
              _id: item.productId, 
              name: item.name,
              image: item.image 
            })
          }))
        }));

        setOrders(processedOrders);
      } catch (error) {
        if (error.name === 'AbortError') return;
        
        if (isMounted) {
          console.error('Error in OrderHistory:', error);
          setError(error.message);
          toast.error('Failed to load order history');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId, createProductsMap, findProductImage]);

  if (loading) {
    return (
      <div className="">
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
                <div className="relative h-16 w-16 flex-shrink-0 bg-gray-50 rounded-md">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-md p-1"
                      sizes="(max-width: 64px) 100vw, 64px"
                      onError={(e) => {
                        console.error('Image failed to load:', {
                          src: item.image,
                          name: item.name,
                          error: e
                        });
                        setImageErrors(prev => ({
                          ...prev,
                          [item._id]: true
                        }));
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-sm text-[#003366] truncate">
                    {item.name}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      ${item.price.toFixed(2)}
                    </span>
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