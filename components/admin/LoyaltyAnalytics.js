'use client';

import { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LoyaltyAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/loyalty/analytics?days=${timeframe}`);
      const data = await response.json();
      setMetrics(data.metrics);
      setTrendData(data.trends);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Loyalty Program Analytics</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Active Users',
            value: metrics?.activeUsers,
            change: '+12%',
            positive: true
          },
          {
            title: 'Average Points',
            value: metrics?.averagePoints,
            change: '+5%',
            positive: true
          },
          {
            title: 'Active Coupons',
            value: metrics?.couponMetrics.active,
            change: '-3%',
            positive: false
          },
          {
            title: 'Coupon Usage Rate',
            value: `${Math.round((metrics?.couponMetrics.used / metrics?.couponMetrics.total) * 100)}%`,
            change: '+2%',
            positive: true
          }
        ].map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              <span className={`ml-2 text-sm font-medium ${
                metric.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Points Earned Trend</h3>
          {trendData && (
            <Line
              data={{
                labels: Object.keys(trendData),
                datasets: [{
                  label: 'Points Earned',
                  data: Object.values(trendData).map(d => d.points),
                  borderColor: 'rgb(59, 130, 246)',
                  tension: 0.1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
              height={300}
            />
          )}
        </div>

        {/* Tier Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tier Distribution</h3>
          {metrics?.tierDistribution && (
            <Pie
              data={{
                labels: Object.keys(metrics.tierDistribution),
                datasets: [{
                  data: Object.values(metrics.tierDistribution),
                  backgroundColor: [
                    '#CBD5E1', // None
                    '#93C5FD', // Silver
                    '#FCD34D', // Gold
                    '#A78BFA', // Platinum
                    '#38BDF8', // Sapphire
                    '#2DD4BF', // Diamond
                    '#F472B6'  // Legend
                  ]
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
              height={300}
            />
          )}
        </div>
      </div>
    </div>
  );
} 