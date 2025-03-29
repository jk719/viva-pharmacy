"use client";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

export default function ProductEditHistory({ productId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEditHistory = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}/history`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        const data = await response.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error('Error fetching edit history:', err);
        setError('Failed to load edit history');
      } finally {
        setLoading(false);
      }
    };

    fetchEditHistory();
  }, [productId]);

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
    <div className="bg-white border-l border-gray-200 w-80 p-4 h-full overflow-auto">
      <h2 className="text-lg font-medium mb-4">Edit History</h2>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No edit history available for this product
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((edit, index) => (
            <div key={index} className="border-b border-gray-200 last:border-0 pb-4">
              <div className="mb-2">
                <div className="font-medium">{edit.editedBy}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(edit.timestamp), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
              {renderChanges(edit)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 