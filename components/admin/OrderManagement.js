"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Completed'];

export default function OrderManagement() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/admin');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage('Error loading orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderNumberMatch = order?.orderNumber ? 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) : 
        false;
      
      const emailMatch = order?.userId?.email ? 
        order.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) : 
        false;

      const matchesSearch = orderNumberMatch || emailMatch;
      const matchesStatus = statusFilter === 'All' || order?.status === statusFilter;
      
      const matchesDate = (!dateRange.start || new Date(order?.createdAt) >= new Date(dateRange.start)) &&
                         (!dateRange.end || new Date(order?.createdAt) <= new Date(dateRange.end));
      
      const matchesPrice = (!priceRange.min || order?.total >= Number(priceRange.min)) &&
                          (!priceRange.max || order?.total <= Number(priceRange.max));
      
      return matchesSearch && matchesStatus && matchesDate && matchesPrice;
    });
  }, [orders, searchTerm, statusFilter, dateRange, priceRange]);

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800',
      Completed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {ORDER_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiFilter />
          <span>Advanced Filters</span>
        </button>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
          <button 
            onClick={() => setMessage('')}
            className="float-right text-sm hover:text-opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order?.id || Math.random()} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{order?.orderNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{order?.userId?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order?.userId?.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order?.status)}`}>
                    {order?.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${(order?.total || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => window.location.href = `/admin/orders/${order?.id}`}
                    className="text-primary hover:text-primary/80"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Order List */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order?.id || Math.random()} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">#{order?.orderNumber || 'N/A'}</h3>
                <p className="text-sm text-gray-500">{order?.userId?.email || 'N/A'}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order?.status)}`}>
                {order?.status || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div className="font-medium">${(order?.total || 0).toFixed(2)}</div>
            </div>
            <button
              onClick={() => window.location.href = `/admin/orders/${order?.id}`}
              className="w-full mt-4 text-center px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 