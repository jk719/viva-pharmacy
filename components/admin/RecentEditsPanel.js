"use client";
import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TimeAgo from '@/components/TimeAgo';

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

export default function RecentEditsPanel() {
  const [recentEdits, setRecentEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const fetchRecentEdits = async () => {
    try {
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
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchRecentEdits, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mobile collapsible header
  const MobileHeader = () => (
    <div className="md:hidden w-full bg-white border-b p-4">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <FiClock className="text-gray-500" />
          <span className="font-medium">Recent Edits</span>
        </div>
        {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
      </button>
    </div>
  );

  const renderChanges = (edit) => {
    const mainChanges = edit.changes.slice(0, 3).map(change => 
      formatChange(change.field, change.oldValue, change.newValue)
    );

    const remainingCount = edit.changes.length - 3;

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
    <>
      <MobileHeader />
      <div className={`
        md:block
        ${isCollapsed ? 'hidden' : 'block'}
        md:w-80
        w-full
        bg-white
        border-l
        overflow-hidden
        flex
        flex-col
        h-full
      `}>
        <div className="hidden md:block p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock className="text-gray-500" />
              <h2 className="font-medium">Recent Edits</h2>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500 text-center">{error}</div>
          ) : recentEdits.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No recent edits</div>
          ) : (
            <div className="space-y-4 p-4">
              {recentEdits.map((edit, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-0 pb-4"
                >
                  <Link
                    href={`/admin/products/edit/${edit.productId}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {edit.productName}
                  </Link>
                  <div className="text-sm text-gray-500 mb-2">
                    <TimeAgo date={edit.timestamp} /> by {edit.editedBy}
                  </div>
                  {renderChanges(edit)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 