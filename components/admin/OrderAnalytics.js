"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { FiDownload, FiRefreshCcw } from 'react-icons/fi';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function OrderAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [dateRange, refreshKey]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/admin/stats?range=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!stats?.orders) return;

    const worksheet = XLSX.utils.json_to_sheet(stats.orders.map(order => ({
      OrderNumber: order.orderNumber,
      Date: new Date(order.createdAt).toLocaleDateString(),
      Customer: order.userId?.name || 'N/A',
      Status: order.status,
      Total: `$${order.total?.toFixed(2) || '0.00'}`,
      PaymentMethod: order.paymentMethod || 'N/A',
      DeliveryMethod: order.deliveryMethod || 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <FiRefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <FiDownload className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-primary">
            ${stats.totalRevenue?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-primary">
            {stats.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-primary">
            ${(stats.totalOrders ? stats.totalRevenue / stats.totalOrders : 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6" style={{ height: '400px' }}>
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          <div style={{ position: 'relative', height: '300px', maxHeight: '300px', width: '100%' }}>
            <Line
              data={{
                labels: stats.trends?.map(t => t.date) || [],
                datasets: [{
                  label: 'Daily Revenue',
                  data: stats.trends?.map(t => t.revenue) || [],
                  borderColor: 'rgb(59, 130, 246)',
                  tension: 0.1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: Math.max(...(stats.trends?.map(t => t.revenue) || [0])) * 1.1
                  }
                },
                layout: {
                  padding: {
                    top: 10,
                    bottom: 10
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6" style={{ height: '400px' }}>
          <h3 className="text-lg font-medium mb-4">Order Status Distribution</h3>
          <div style={{ position: 'relative', height: '300px', maxHeight: '300px', width: '100%' }}>
            <Pie
              data={{
                labels: Object.keys(stats.statusDistribution || {}),
                datasets: [{
                  data: Object.values(stats.statusDistribution || {}),
                  backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#6366F1'
                  ]
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                layout: {
                  padding: 20
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}