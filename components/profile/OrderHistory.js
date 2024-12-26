'use client';

import { useEffect, useState } from 'react';
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

  // Update findProductImage function
  const findProductImage = (productId, productName) => {
    console.log('Looking for image:', { productId, productName });
    
    // Try to find direct match in Cloudinary URLs first
    const directMatch = findMatchingCloudinaryUrl(productName);
    if (directMatch) {
      console.log('Found direct Cloudinary match:', directMatch);
      return directMatch;
    }
    
    // Try to find by product ID
    const productById = productsMap[productId];
    if (productById) {
      console.log('Found product by ID:', productById);
      const cloudinaryMatch = findMatchingCloudinaryUrl(productById.name);
      if (cloudinaryMatch) {
        console.log('Found Cloudinary match for product:', cloudinaryMatch);
        return cloudinaryMatch;
      }
    }
    
    // Try to find by product name
    const productByName = Object.values(productsMap).find(p => 
      normalizeProductName(p.name) === normalizeProductName(productName)
    );
    
    if (productByName) {
      console.log('Found product by name:', productByName);
      const cloudinaryMatch = findMatchingCloudinaryUrl(productByName.name);
      if (cloudinaryMatch) {
        console.log('Found Cloudinary match for name:', cloudinaryMatch);
        return cloudinaryMatch;
      }
    }
    
    console.log('No image found for:', { productId, productName });
    return null;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      try {
        // Fetch products first
        const productsData = await fetchProducts();
        console.log('All products:', productsData.products);
        
        if (productsData.success) {
          const productMapping = {};
          productsData.products.forEach(product => {
            productMapping[product._id] = product;
          });
          console.log('Product mapping created:', productMapping);
          setProductsMap(productMapping);
        }

        // Fetch orders
        const response = await fetch(`/api/orders/${userId}`);
        const data = await response.json();
        console.log('Raw orders data:', data);
        
        if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
        if (!Array.isArray(data)) throw new Error('Invalid data format received from server');

        const ordersWithImages = data.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            image: findProductImage(item.productId, item.name)
          }))
        }));

        console.log('Final processed orders:', ordersWithImages);
        setOrders(ordersWithImages);
      } catch (error) {
        console.error('Error in OrderHistory:', error);
        setError(error.message);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
                <div className="relative h-16 w-16 flex-shrink-0 bg-gray-50 rounded-md">
                  {item.image && !imageErrors[item._id] ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-md"
                      sizes="64px"
                      onError={() => {
                        console.error('Image failed to load:', item.image);
                        setImageErrors(prev => ({
                          ...prev,
                          [item._id]: true
                        }));
                      }}
                      unoptimized
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