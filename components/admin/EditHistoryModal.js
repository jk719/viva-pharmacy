"use client";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function EditHistoryModal({ isOpen, onClose, productId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && productId) {
      fetchEditHistory();
    }
  }, [isOpen, productId]);

  const fetchEditHistory = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/history`);
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error('Error fetching edit history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Edit History</h2>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((edit, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{edit.editedBy}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(edit.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {edit.changes.map((change, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{change.field}:</span>
                        <span className="text-red-500 line-through mx-2">
                          {String(change.oldValue)}
                        </span>
                        <span className="text-green-500">
                          {String(change.newValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 