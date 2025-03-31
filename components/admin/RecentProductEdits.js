"use client";
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { FiClock, FiExternalLink } from 'react-icons/fi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function formatChange(field, oldValue, newValue) {
  // Handle nested objects
  if (field === 'seo') {
    return 'SEO metadata updated';
  }

  // Handle arrays
  if (Array.isArray(oldValue) || Array.isArray(newValue)) {
    return `${field} list updated`;
  }

  // Handle objects
  if (typeof oldValue === 'object' || typeof newValue === 'object') {
    return `${field} details updated`;
  }

  // Handle simple value changes
  if (oldValue === '' || oldValue === undefined) {
    return `${field} set to "${newValue}"`;
  }

  if (newValue === '' || newValue === undefined) {
    return `${field} removed`;
  }

  return `${field} changed from "${oldValue}" to "${newValue}"`;
}

export default function RecentProductEdits() {
  const [recentEdits, setRecentEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentEdits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/recent-edits');
      if (!response.ok) throw new Error('Failed to fetch recent edits');
      const data = await response.json();
      setRecentEdits(data.edits);
    } catch (err) {
      setError('Failed to load recent edits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentEdits();
    // Poll for updates every 60 seconds
    const interval = setInterval(fetchRecentEdits, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderChanges = (edit) => {
    const mainChanges = edit.changes.slice(0, 2).map(change => 
      formatChange(change.field, change.oldValue, change.newValue)
    );

    const remainingCount = edit.changes.length - 2;

    return (
      <div className="space-y-1">
        {mainChanges.map((change, i) => (
          <div key={i} className="text-sm text-gray-600">
            • {change}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-sm text-gray-500 italic">
            +{remainingCount} more {remainingCount === 1 ? 'change' : 'changes'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <FiClock className="text-primary" />
          <h2 className="text-lg font-medium">Recent Product Edits</h2>
        </div>
        <button 
          onClick={fetchRecentEdits}
          className="text-sm text-primary hover:text-primary/80"
        >
          Refresh
        </button>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        ) : recentEdits.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No recent edits available
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEdits.slice(0, 6).map((edit, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-[300px] md:w-auto border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Link 
                      href={`/admin/products/edit/${edit.productId}`}
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {edit.productName}
                      <FiExternalLink className="w-3 h-3" />
                    </Link>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(edit.timestamp), { addSuffix: true })} by {edit.editedBy}
                    </div>
                  </div>
                </div>
                {renderChanges(edit)}
              </div>
            ))}
          </div>
        )}
        
        {recentEdits.length > 6 && (
          <div className="text-center mt-4">
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              View All Recent Edits
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 