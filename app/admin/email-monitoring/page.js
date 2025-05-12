'use client';

import { useState, useEffect } from 'react';
import { getEmailMonitoringStats } from '@/app/actions/emailAdmin';
import { FiMail, FiAlertTriangle, FiBarChart, FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function EmailMonitoringPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await getEmailMonitoringStats();
      if (result.success) {
        setStats(result.stats);
        setLastUpdated(new Date());
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch email statistics');
      console.error('Error fetching email stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <h2 className="text-xl font-bold text-red-600 flex items-center">
          <FiAlertTriangle className="mr-2" /> Error Loading Email Statistics
        </h2>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-gray-900">
          <FiMail className="mr-2" /> Email Monitoring Dashboard
        </h1>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-sm text-gray-500 mr-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <FiRefreshCw className="mr-2" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-2">
            <FiMail className="text-blue-500 mr-2 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Total Emails</h2>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats?.sent || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Successful email deliveries</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-2">
            <FiAlertTriangle className="text-red-500 mr-2 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Failed Emails</h2>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats?.failed || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Delivery failures</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-2">
            <FiBarChart className="text-green-500 mr-2 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Success Rate</h2>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats?.successRate || '0%'}</p>
          <p className="text-sm text-gray-500 mt-2">Delivery success percentage</p>
        </div>
      </div>

      {/* Template Stats */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Email Templates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats && Object.entries(stats.templates || {}).map(([template, data]) => (
                <tr key={template}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {template}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.sent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.failed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.sent > 0 
                      ? ((data.sent / (data.sent + data.failed)) * 100).toFixed(2) + '%' 
                      : '0%'}
                  </td>
                </tr>
              ))}
              {(!stats || Object.keys(stats.templates || {}).length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No email templates data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Errors</h2>
        </div>
        <div className="overflow-x-auto">
          {stats && stats.lastErrors && stats.lastErrors.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.lastErrors.map((error, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.template}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.recipient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FiCheckCircle className="mx-auto mb-4 text-4xl text-green-500" />
              <p>No errors recorded. All emails are sending successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 