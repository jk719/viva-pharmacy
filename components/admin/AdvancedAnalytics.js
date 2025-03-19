'use client';

import { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { ReportingService } from '@/lib/analytics/reportingService';

export default function AdvancedAnalytics() {
  const [timeframe, setTimeframe] = useState('30');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMetrics();
  }, [timeframe]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));
      
      const data = await ReportingService.generateMetrics(startDate, endDate);
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
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
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        <div className="flex gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'engagement', 'retention', 'revenue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Program Growth</h3>
            <Line
              data={metrics.overview.growth}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true }
                }
              }}
              height={300}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tier Distribution</h3>
            <Pie
              data={metrics.overview.tiers}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
              height={300}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Points Economy</h3>
            <Bar
              data={metrics.overview.points}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
              height={300}
            />
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
            <Line
              data={metrics.engagement.activity}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
              height={300}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Coupon Usage</h3>
              <Bar
                data={metrics.engagement.coupons}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
                height={300}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Event Participation</h3>
              <Bar
                data={metrics.engagement.events}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
                height={300}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Retention and Revenue tabs content similarly */}
    </div>
  );
} 