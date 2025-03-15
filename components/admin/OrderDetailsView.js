"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiPackage, FiUser, FiTruck, FiCreditCard } from 'react-icons/fi';
import Image from 'next/image';
import OrderNotes from './OrderNotes';
import PrintOrder from './PrintOrder';
import RefundModal from './RefundModal';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed'];

export default function OrderDetailsView({ orderId }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #order-print-content,
        #order-print-content * {
          visibility: visible;
        }
        #order-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/admin/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/admin/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      await fetchOrderDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async (refundData) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/admin/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) throw new Error('Failed to process refund');
      
      await fetchOrderDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">
          Order #{order.orderNumber}
        </h1>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
          <select
            value={order.status}
            onChange={(e) => updateOrderStatus(e.target.value)}
            disabled={updating}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiUser className="text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Customer Details</h2>
          </div>
          <div className="space-y-3">
            <p><span className="font-medium">Name:</span> {order.userId?.name}</p>
            <p><span className="font-medium">Email:</span> {order.userId?.email}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiCreditCard className="text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
          </div>
          <div className="space-y-3">
            <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
            <p><span className="font-medium">Status:</span> {order.paymentStatus}</p>
            <p><span className="font-medium">Payment ID:</span> {order.paymentIntentId}</p>
          </div>
          {order.status !== 'Refunded' && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Process Refund
            </button>
          )}
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiTruck className="text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Delivery Details</h2>
          </div>
          <div className="space-y-3">
            <p><span className="font-medium">Method:</span> {order.deliveryMethod}</p>
            <p><span className="font-medium">Time:</span> {order.selectedTime}</p>
            {order.deliveryMethod === 'delivery' && (
              <div className="mt-2">
                <p className="font-medium">Shipping Address:</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiPackage className="text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.image || '/images/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-contain rounded-md"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <OrderNotes orderId={orderId} />
      </div>

      <div className="mt-8">
        <PrintOrder order={order} />
      </div>

      {showRefundModal && (
        <RefundModal
          order={order}
          onClose={() => setShowRefundModal(false)}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
} 